# backend/routers/symbols.py
#
# GET /api/v1/symbols/us
# Returns the full US Common Stock symbol list from Finnhub (24h cache).

import logging
import traceback
from fastapi import APIRouter, HTTPException
from services.symbols import fetch_us_symbols

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/symbols", tags=["symbols"])


@router.get("/us")
async def get_us_symbols():
    """
    Returns all US Common Stock symbols from Finnhub, cached for 24 hours.

    Response shape:
        { "count": 8500, "symbols": [{ "symbol": "AAPL", "name": "Apple Inc" }, ...] }

    Errors:
        503 — Finnhub unavailable or key not configured
    """
    try:
        symbols = await fetch_us_symbols()
        return {"count": len(symbols), "symbols": symbols}
    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"[Symbols Route] Failed to fetch US symbols: {e}\n{tb}")
        raise HTTPException(
            status_code=503,
            detail="Unable to fetch symbol list — Finnhub may be unavailable.",
        )
