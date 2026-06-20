# backend/routers/quote.py
#
# GET /api/v1/quote/{symbol}
# Thin wrapper around services/quote.py — returns live price from
# Finnhub (or AV fallback) as JSON.

import logging
from fastapi import APIRouter, HTTPException
from services.quote import fetch_current_quote, DataProviderError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/quote", tags=["quote"])


@router.get("/{symbol}")
async def get_quote(symbol: str):
    """
    Returns a live stock quote.
    Primary source: Finnhub. Fallback: Alpha Vantage.

    Response shape:
        { "symbol": "AAPL", "price": 213.45, "change_percent": 0.82, "source": "finnhub" }

    Errors:
        404 — symbol not recognised by either provider
        503 — both providers are unavailable / rate-limited
    """
    sym = symbol.upper().strip()
    if not sym:
        raise HTTPException(status_code=404, detail="Symbol is required")

    try:
        quote = await fetch_current_quote(sym)
        return {"symbol": sym, **quote}
    except DataProviderError as e:
        logger.error(f"[Quote Route] Both providers failed for {sym}: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Quote unavailable for {sym} — both primary and fallback providers failed."
        )
    except ValueError as e:
        # Symbol not found
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"[Quote Route] Unexpected error for {sym}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")
