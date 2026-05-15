# backend/routers/analysis.py

from fastapi import APIRouter, HTTPException
from services.quote import fetch_daily_ohlcv, fetch_current_quote
from services.indicators import compute_indicators, compute_signal
from models.analysis import AnalysisResponse

router = APIRouter()


@router.get("/analysis/{symbol}", response_model=AnalysisResponse)
async def get_analysis(symbol: str):
    symbol = symbol.upper().strip()

    try:
        df = await fetch_daily_ohlcv(symbol)
        quote = await fetch_current_quote(symbol)
    except ValueError as e:
        if "RATE_LIMIT" in str(e):
            raise HTTPException(status_code=429, detail="Alpha Vantage rate limit reached")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fetch error: {str(e)}")

    if len(df) < 50:
        raise HTTPException(
            status_code=422,
            detail=f"Not enough data for {symbol} (need 50 days, got {len(df)})"
        )

    try:
        indicators = compute_indicators(df)
        signal, confidence = compute_signal(indicators, indicators.rsi)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indicator error: {str(e)}")

    return AnalysisResponse(
        symbol=symbol,
        signal=signal,
        confidence=confidence,
        indicators=indicators,
        price=quote["price"],
        change_percent=quote["change_percent"],
    )