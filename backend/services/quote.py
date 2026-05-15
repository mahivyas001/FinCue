# backend/services/quote.py

import os
import httpx
import pandas as pd
from dotenv import load_dotenv

load_dotenv()
AV_KEY = os.getenv("AV_KEY")
BASE_URL = "https://www.alphavantage.co/query"


async def fetch_daily_ohlcv(symbol: str) -> pd.DataFrame:
    """Fetch TIME_SERIES_DAILY and return as sorted DataFrame."""
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(BASE_URL, params={
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "outputsize": "compact",  # 100 days
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
            "date": pd.to_datetime(date_str),
            "open":   float(values["1. open"]),
            "high":   float(values["2. high"]),
            "low":    float(values["3. low"]),
            "close":  float(values["4. close"]),
            "volume": int(values["5. volume"]),
        })

    df = pd.DataFrame(rows).sort_values("date").reset_index(drop=True)
    return df


async def fetch_current_quote(symbol: str) -> dict:
    """Fetch GLOBAL_QUOTE for latest price + change."""
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(BASE_URL, params={
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": AV_KEY,
        })
    r.raise_for_status()
    data = r.json()

    quote = data.get("Global Quote", {})
    if not quote:
        raise ValueError(f"No quote for symbol: {symbol}")

    return {
        "price": float(quote["05. price"]),
        "change_percent": float(quote["10. change percent"].replace("%", "")),
    }