# backend/services/market_data.py

import os
import requests
import pandas as pd
from core.config import settings
from core.cache import cache
import logging

logger = logging.getLogger(__name__)

AV_BASE = "https://www.alphavantage.co/query"
TWELVE_DATA_BASE = "https://api.twelvedata.com"

AV_KEY = os.getenv("AV_API_KEY", "")
TWELVE_DATA_KEY = os.getenv("TWELVE_DATA_API_KEY", "")

def _fetch_twelve_data_sync(symbol: str) -> pd.DataFrame:
    """Fetch from Twelve Data time_series endpoint synchronously."""
    if not TWELVE_DATA_KEY:
        raise RuntimeError("TWELVE_DATA_API_KEY not configured")

    url = f"{TWELVE_DATA_BASE}/time_series"
    resp = requests.get(url, params={
        "symbol":     symbol,
        "interval":   "1day",
        "outputsize": 100,
        "apikey":     TWELVE_DATA_KEY,
    }, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    if data.get("status") == "error":
        raise RuntimeError(f"Twelve Data error: {data.get('message')}")

    values = data.get("values")
    if not values:
        raise RuntimeError("Twelve Data: no OHLCV values returned")

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

def _fetch_alpha_vantage_sync(symbol: str) -> pd.DataFrame:
    """Fetch TIME_SERIES_DAILY from Alpha Vantage synchronously."""
    if not AV_KEY:
        raise RuntimeError("AV_API_KEY not configured")

    params = {
        "function":   "TIME_SERIES_DAILY",
        "symbol":     symbol,
        "outputsize": "compact",
        "apikey":     AV_KEY,
    }
    resp = requests.get(AV_BASE, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    if "Note" in data or "Information" in data:
        raise RuntimeError("Alpha Vantage rate limit reached.")

    series = data.get("Time Series (Daily)")
    if not series:
        raise RuntimeError(f"No time series data for {symbol}.")

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

def fetch_daily_series(symbol: str) -> pd.DataFrame:
    """
    Fetch 100-day daily OHLCV with Twelve Data (primary) and Alpha Vantage (fallback).
    Returns a DataFrame with columns: date, open, high, low, close, volume, source.
    """
    symbol = symbol.upper().strip()
    cache_key = f"daily:{symbol}"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info(f"[Cache HIT] daily series for {symbol}")
        return cached

    # Try Twelve Data first
    try:
        df = _fetch_twelve_data_sync(symbol)
        logger.info(f"[OHLCV Sync] {symbol} via Twelve Data: {len(df)} candles")
        cache.set(cache_key, df)
        return df
    except Exception as e:
        logger.warning(f"[OHLCV Sync Fallback] Twelve Data failed for {symbol}: {e}. Trying Alpha Vantage.")

    # Fallback to Alpha Vantage
    try:
        df = _fetch_alpha_vantage_sync(symbol)
        logger.info(f"[OHLCV Sync] {symbol} via AV fallback: {len(df)} candles")
        cache.set(cache_key, df)
        return df
    except Exception as e:
        raise RuntimeError(f"All daily series providers failed for {symbol}: {e}") from e