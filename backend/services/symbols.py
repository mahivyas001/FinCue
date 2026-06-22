# backend/services/symbols.py
#
# Fetches the full US Common Stock symbol list from Finnhub.
# Cached in-memory for 24 hours — no reason to re-fetch every request.

import time
import logging
import httpx
from core.config import settings

logger = logging.getLogger(__name__)

FINNHUB_BASE = "https://finnhub.io/api/v1"
SYMBOLS_TTL  = 24 * 3600  # 24 hours

# Module-level cache — (data, fetched_at) tuple, or None if not yet loaded
_cache: tuple[list[dict], float] | None = None


async def fetch_us_symbols() -> list[dict]:
    """
    Returns a list of dicts: [{symbol, name}, ...]
    Filters Finnhub /stock/symbol to type == 'Common Stock' only.
    Result is cached for 24 hours in process memory.
    """
    global _cache

    # Return cached result if still fresh
    if _cache is not None:
        data, fetched_at = _cache
        age = time.time() - fetched_at
        if age < SYMBOLS_TTL:
            logger.debug(f"[Symbols Cache HIT] {len(data)} symbols (age {int(age)}s)")
            return data

    if not settings.FINNHUB_API_KEY:
        raise RuntimeError("FINNHUB_API_KEY not configured")

    logger.info("[Symbols] Fetching US symbol list from Finnhub…")
    url = f"{FINNHUB_BASE}/stock/symbol"
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(url, params={
            "exchange": "US",
            "token":    settings.FINNHUB_API_KEY,
        })
    r.raise_for_status()
    raw: list[dict] = r.json()

    # Filter to Common Stock only; keep only symbol + description (company name)
    symbols = [
        {"symbol": item["symbol"], "name": item.get("description", item["symbol"])}
        for item in raw
        if item.get("type") == "Common Stock"
        and item.get("symbol")
    ]

    # Sort alphabetically by symbol for predictable ordering
    symbols.sort(key=lambda x: x["symbol"])

    _cache = (symbols, time.time())
    logger.info(f"[Symbols] Cached {len(symbols)} US common stocks from Finnhub")
    return symbols
