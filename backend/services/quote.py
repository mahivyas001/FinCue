# backend/services/quote.py
#
# Data provider hierarchy:
#   Live quotes:     Finnhub  →  Alpha Vantage (fallback)
#   OHLCV history:   Twelve Data  →  Alpha Vantage (fallback)
#
# Cache TTLs:
#   Quotes:  60 seconds (Finnhub is fast/generous, but we don't hammer it)
#   OHLCV:   4 hours    (daily candles don't meaningfully change intraday)

import os
import time
import logging
import httpx
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── API keys ────────────────────────────────────────────────────────────────
AV_KEY           = os.getenv("AV_API_KEY", "")
FINNHUB_KEY      = os.getenv("FINNHUB_API_KEY", "")
TWELVE_DATA_KEY  = os.getenv("TWELVE_DATA_API_KEY", "")

# ── Base URLs ────────────────────────────────────────────────────────────────
AV_BASE          = "https://www.alphavantage.co/query"
FINNHUB_BASE     = "https://finnhub.io/api/v1"
TWELVE_DATA_BASE = "https://api.twelvedata.com"

# ── Cache config ─────────────────────────────────────────────────────────────
QUOTE_TTL  = 60          # 1 minute
OHLCV_TTL  = 4 * 3600    # 4 hours

_cache: dict[str, dict] = {}


class DataProviderError(Exception):
    """Raised when both primary and fallback providers fail."""


# ── Internal cache helpers ────────────────────────────────────────────────────

def _get(key: str) -> dict | None:
    entry = _cache.get(key)
    if entry and time.time() - entry["ts"] < entry["ttl"]:
        return entry["data"]
    return None


def _set(key: str, data: dict | pd.DataFrame, ttl: int) -> None:
    _cache[key] = {"data": data, "ts": time.time(), "ttl": ttl}


async def search_symbols(query: str) -> list[dict]:
    """Search Finnhub's global symbol directory."""
    q_clean = query.upper().strip()
    cache_key = f"search:{q_clean}"
    cached = _get(cache_key)
    if cached is not None:
        logger.info(f"[Search Cache HIT] {q_clean}")
        return cached

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{FINNHUB_BASE}/search",
            params={"q": query, "token": FINNHUB_KEY},
            timeout=10.0,
        )
    resp.raise_for_status()
    raw = resp.json()
    results = [
        {
            "symbol": item["symbol"],
            "name": item["description"],
            "type": item.get("type", "Common Stock"),
        }
        for item in raw.get("result", [])[:20]  # cap results, don't flood the UI
    ]
    _set(cache_key, results, 3600)  # cache for 1 hr (3600 seconds)
    return results


# ── LIVE QUOTE ────────────────────────────────────────────────────────────────

async def _fetch_quote_finnhub(symbol: str) -> dict:
    """Primary: Finnhub /quote endpoint. Returns price, change_percent, source."""
    if not FINNHUB_KEY:
        raise DataProviderError("FINNHUB_API_KEY not configured")

    url = f"{FINNHUB_BASE}/quote"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, params={"symbol": symbol, "token": FINNHUB_KEY})
    r.raise_for_status()
    data = r.json()

    price = data.get("c")   # current price
    pc    = data.get("pc")  # previous close
    if (price is None or price == 0) and (pc is None or pc == 0):
        raise ValueError(f"Symbol not found: {symbol}")
    if not price or price == 0:
        raise DataProviderError(f"Finnhub: no price data for {symbol}")

    change_pct = ((price - pc) / pc * 100) if pc and pc != 0 else 0.0
    change = price - pc if pc is not None else 0.0
    market_hours_plausible = not (change == 0.0 and change_pct == 0.0)

    return {
        "price":                  round(float(price), 4),
        "change_percent":         round(float(change_pct), 4),
        "source":                 "finnhub",
        "market_hours_plausible": market_hours_plausible,
    }


async def _fetch_quote_alpha_vantage(symbol: str) -> dict:
    """Fallback: Alpha Vantage GLOBAL_QUOTE. AV returns 200 even on rate-limit."""
    if not AV_KEY:
        raise DataProviderError("AV_API_KEY not configured")

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(AV_BASE, params={
            "function": "GLOBAL_QUOTE",
            "symbol":   symbol,
            "apikey":   AV_KEY,
        })
    r.raise_for_status()
    data = r.json()

    # AV signals rate-limits via a "Note" or "Information" key (still HTTP 200)
    if "Note" in data or "Information" in data:
        raise DataProviderError("Alpha Vantage GLOBAL_QUOTE rate-limited")

    if "Error Message" in data:
        raise ValueError(f"Symbol not found: {symbol}")

    quote = data.get("Global Quote")
    if quote == {}:
        raise ValueError(f"Symbol not found: {symbol}")
    if not quote or "05. price" not in quote:
        raise DataProviderError(f"Alpha Vantage: no quote data for {symbol}")

    raw_pct = quote.get("10. change percent", "0%").replace("%", "")
    av_price = float(quote["05. price"])
    av_change = float(quote.get("09. change", 0.0))
    av_change_pct = float(raw_pct)
    market_hours_plausible = not (av_change == 0.0 and av_change_pct == 0.0)

    return {
        "price":                  round(av_price, 4),
        "change_percent":         round(av_change_pct, 4),
        "source":                 "alpha_vantage_fallback",
        "market_hours_plausible": market_hours_plausible,
    }


async def fetch_current_quote(symbol: str) -> dict:
    """
    Public: fetch live quote with provider fallback.
    Returns dict with keys: price, change_percent, source.
    Raises ValueError if symbol invalid.
    Raises DataProviderError if both providers fail.
    """
    sym = symbol.upper()
    cache_key = f"quote:{sym}"
    cached = _get(cache_key)
    if cached is not None:
        logger.info(f"[Quote Cache HIT] {sym}")
        return cached

    # Try Finnhub first
    finnhub_error = None
    try:
        result = await _fetch_quote_finnhub(sym)
        logger.info(f"[Quote] {sym} via Finnhub: ${result['price']}")
        _set(cache_key, result, QUOTE_TTL)
        return result
    except ValueError as e:
        finnhub_error = e
        logger.warning(f"[Quote] Finnhub returned invalid symbol error for {sym}: {e}")
    except Exception as e:
        finnhub_error = e
        logger.warning(f"[Quote Fallback] Finnhub failed for {sym}: {e}. Trying Alpha Vantage.")

    # Fallback to Alpha Vantage
    try:
        result = await _fetch_quote_alpha_vantage(sym)
        logger.info(f"[Quote] {sym} via AV fallback: ${result['price']}")
        _set(cache_key, result, QUOTE_TTL)
        return result
    except ValueError as e:
        raise e
    except Exception as e:
        if isinstance(finnhub_error, ValueError):
            raise finnhub_error
        raise DataProviderError(f"All quote providers failed for {sym}: {e}") from e


# ── OHLCV HISTORY ─────────────────────────────────────────────────────────────

async def _fetch_ohlcv_twelve_data(symbol: str, outputsize: int = 100) -> pd.DataFrame:
    """Primary: Twelve Data /time_series endpoint. Returns daily OHLCV DataFrame."""
    if not TWELVE_DATA_KEY:
        raise DataProviderError("TWELVE_DATA_API_KEY not configured")

    url = f"{TWELVE_DATA_BASE}/time_series"
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url, params={
            "symbol":     symbol,
            "interval":   "1day",
            "outputsize": outputsize,
            "apikey":     TWELVE_DATA_KEY,
        })
    r.raise_for_status()
    data = r.json()

    # Twelve Data signals errors via "status": "error" or missing "values"
    if data.get("status") == "error":
        if data.get("code") == 404 or "not found" in data.get("message", "").lower():
            raise ValueError(f"Symbol not found: {symbol}")
        raise DataProviderError(f"Twelve Data error for {symbol}: {data.get('message')}")

    values = data.get("values")
    if not values:
        raise DataProviderError(f"Twelve Data: no OHLCV values returned for {symbol}")

    rows = []
    for v in values:
        rows.append({
            "date":   pd.to_datetime(v["datetime"]),
            "open":   float(v["open"]),
            "high":   float(v["high"]),
            "low":    float(v["low"]),
            "close":  float(v["close"]),
            "volume": int(float(v.get("volume", 0))),
            "source": "twelve_data",
        })

    df = pd.DataFrame(rows).sort_values("date").reset_index(drop=True)
    return df


async def _fetch_ohlcv_alpha_vantage(symbol: str) -> pd.DataFrame:
    """Fallback: Alpha Vantage TIME_SERIES_DAILY. AV returns 200 even on rate-limit."""
    if not AV_KEY:
        raise DataProviderError("AV_API_KEY not configured")

    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(AV_BASE, params={
            "function":   "TIME_SERIES_DAILY",
            "symbol":     symbol,
            "outputsize": "compact",
            "apikey":     AV_KEY,
        })
    r.raise_for_status()
    data = r.json()

    # AV signals rate-limits via "Note" / "Information" (still HTTP 200)
    if "Note" in data or "Information" in data:
        raise DataProviderError("Alpha Vantage TIME_SERIES_DAILY rate-limited")

    if "Error Message" in data:
        raise ValueError(f"Symbol not found: {symbol}")

    series = data.get("Time Series (Daily)")
    if not series:
        raise DataProviderError(f"Alpha Vantage: no OHLCV data for {symbol}")

    rows = []
    for date_str, values in series.items():
        rows.append({
            "date":   pd.to_datetime(date_str),
            "open":   float(values["1. open"]),
            "high":   float(values["2. high"]),
            "low":    float(values["3. low"]),
            "close":  float(values["4. close"]),
            "volume": int(values["5. volume"]),
            "source": "alpha_vantage_fallback",
        })

    df = pd.DataFrame(rows).sort_values("date").reset_index(drop=True)
    return df


async def fetch_daily_ohlcv(symbol: str) -> pd.DataFrame:
    """
    Public: fetch 100-day daily OHLCV with provider fallback.
    Returns a DataFrame with columns: date, open, high, low, close, volume, source.
    Raises ValueError if symbol invalid.
    Raises DataProviderError if both providers fail.
    """
    sym = symbol.upper()
    cache_key = f"ohlcv:{sym}"
    cached = _get(cache_key)
    if cached is not None:
        logger.info(f"[OHLCV Cache HIT] {sym}")
        return cached

    # Try Twelve Data first
    twelve_error = None
    try:
        df = await _fetch_ohlcv_twelve_data(sym)
        logger.info(f"[OHLCV] {sym} via Twelve Data: {len(df)} candles")
        _set(cache_key, df, OHLCV_TTL)
        return df
    except ValueError as e:
        twelve_error = e
        logger.warning(f"[OHLCV] Twelve Data returned invalid symbol error for {sym}: {e}")
    except Exception as e:
        twelve_error = e
        logger.warning(f"[OHLCV Fallback] Twelve Data failed for {sym}: {e}. Trying Alpha Vantage.")

    # Fallback to Alpha Vantage
    try:
        df = await _fetch_ohlcv_alpha_vantage(sym)
        logger.info(f"[OHLCV] {sym} via AV fallback: {len(df)} candles")
        _set(cache_key, df, OHLCV_TTL)
        return df
    except ValueError as e:
        raise e
    except Exception as e:
        if isinstance(twelve_error, ValueError):
            raise twelve_error
        raise DataProviderError(f"All OHLCV providers failed for {sym}: {e}") from e


# ── Compatibility shim for existing callers ───────────────────────────────────
# services/track_record.py calls fetch_current_quote(symbol) — that's preserved above.
# routers/explain.py calls fetch_daily_ohlcv(symbol) — preserved above.
fetch_quote = fetch_current_quote
fetch_ohlcv_history = fetch_daily_ohlcv