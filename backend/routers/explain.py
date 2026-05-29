from fastapi import APIRouter, HTTPException, Query
from services.explainer import generate_explanation
from services.indicators import compute_indicators, compute_signal
from services.quote import fetch_daily_ohlcv, fetch_current_quote
from models.analysis import AnalysisResponse

router = APIRouter()

@router.get("/api/v1/explain/{symbol}")
async def explain_symbol(
    symbol: str,
    mode: str = Query(default="beginner", pattern="^(beginner|advanced)$")
):
    symbol = symbol.upper()

    try:
        daily_data = await fetch_daily_ohlcv(symbol)
        quote = await fetch_current_quote(symbol)
    except Exception as e:
        raise HTTPException(status_code=429, detail=str(e))

    if daily_data is None or quote is None:
        raise HTTPException(status_code=404, detail=f"{symbol} not found")

    indicators = compute_indicators(daily_data)
    signal, confidence = compute_signal(indicators, indicators.rsi)

    data = AnalysisResponse(
        symbol=symbol,
        signal=signal,
        confidence=confidence,
        indicators=indicators,
        price=quote.get("price", 0.0),
        change_percent=quote.get("change_percent", 0.0),
    )

    try:
        explanation = await generate_explanation(symbol, mode, data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI explanation failed: {str(e)}")

    return {"symbol": symbol, "mode": mode, "explanation": explanation}