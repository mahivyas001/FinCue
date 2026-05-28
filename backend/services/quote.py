import os
import httpx
import pandas as pd
from dotenv import load_dotenv
import time

load_dotenv()
AV_KEY = os.getenv("AV_KEY")
BASE_URL = "https://www.alphavantage.co/query"

_cache: dict = {}
CACHE_TTL = 900  # 15 minutes

def _get_cached(key: str):
    entry = _cache.get(key)
    if entry and time.time() - entry["ts"] < CACHE_TTL:
        return entry["data"]
    return None

def _set_cached(key: str, data):
    _cache[key] = {"data": data, "ts": time.time()}


async def fetch_daily_ohlcv(symbol: str) -> pd.DataFrame:
    cache_key = f"ohlcv_{symbol}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(BASE_URL, params={
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "outputsize": "compact",
            "apikey": AV_KEY,
        })
    r.raise_for_status()
    data = r.json()

    if "Note" in data or "Information" in data:
        raise ValueError("RATE_LIMIT")

    series = data.get("Time Series (Daily)")
    if not series:
        raise ValueError(f"No data for symbol: {symbol}")

    rows = []
    for date_str, values in series.items():
        rows.append({
            "date":   pd.to_datetime(date_str),
            "open":   float(values["1. open"]),
            "high":   float(values["2. high"]),
            "low":    float(values["3. low"]),
            "close":  float(values["4. close"]),
            "volume": int(values["5. volume"]),
        })

    df = pd.DataFrame(rows).sort_values("date").reset_index(drop=True)
    _set_cached(cache_key, df)
    return df


async def fetch_current_quote(symbol: str) -> dict:
    cache_key = f"quote_{symbol}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(BASE_URL, params={
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": AV_KEY,
        })
    r.raise_for_status()
    data = r.json()

    if "Note" in data or "Information" in data:
        raise ValueError("RATE_LIMIT")

    quote = data.get("Global Quote", {})
    if not quote:
        raise ValueError(f"No quote for symbol: {symbol}")

    result = {
        "price": float(quote["05. price"]),
        "change_percent": float(quote["10. change percent"].replace("%", "")),
    }
    _set_cached(cache_key, result)
    return result