from fastapi import APIRouter, HTTPException, Query
from services.explainer import generate_explanation
from services.indicators import compute_indicators
from services.quote import fetch_daily_ohlcv, fetch_current_quote
router = APIRouter()

@router.get("/api/v1/explain/{symbol}")
async def explain_symbol(
    symbol: str,
    mode: str = Query(default="beginner", regex="^(beginner|advanced)$")
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
    market = "IN" if symbol.endswith(".BSE") or symbol.endswith(".NSE") else "US"

    data = AnalysisResponse(
        symbol=symbol,
        signal=indicators["signal"],
        confidence=indicators["confidence"],
        market=market,
        price=quote.get("price"),
        change_percent=quote.get("change_percent"),
        indicators=Indicators(
            rsi=indicators["rsi"],
            macd=indicators["macd"],
            moving_average=indicators["moving_average"],
            volume=indicators["volume"],
            trend_strength=indicators["trend_strength"],
        )
    )

    try:
        explanation = await generate_explanation(symbol, mode, data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI explanation failed: {str(e)}")

    return {"symbol": symbol, "mode": mode, "explanation": explanation}
