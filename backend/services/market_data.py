# backend/services/market_data.py

import requests
import pandas as pd
from core.config import settings
from core.cache import cache
import logging

logger = logging.getLogger(__name__)

AV_BASE = "https://www.alphavantage.co/query"

def fetch_daily_series(symbol: str) -> pd.DataFrame:
    """
    Fetch TIME_SERIES_DAILY from Alpha Vantage.
    Returns a DataFrame with columns: open, high, low, close, volume
    Indexed by date (newest last).
    Cached for TTL seconds.
    """
    cache_key = f"daily:{symbol}"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info(f"[Cache HIT] daily series for {symbol}")
        return cached

    logger.info(f"[AV Fetch] daily series for {symbol}")
    params = {
        "function":   "TIME_SERIES_DAILY",
        "symbol":     symbol,
        "outputsize": "compact",       # last 100 trading days
        "apikey":     settings.AV_API_KEY,
    }

    resp = requests.get(AV_BASE, params=params, timeout=10)
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
            "date":   date_str,
            "open":   float(values["1. open"]),
            "high":   float(values["2. high"]),
            "low":    float(values["3. low"]),
            "close":  float(values["4. close"]),
            "volume": int(values["5. volume"]),
        })

    df = pd.DataFrame(rows)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    cache.set(cache_key, df)
    return df