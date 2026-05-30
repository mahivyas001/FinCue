# backend/models/schemas.py

from pydantic import BaseModel
from typing import Optional

class IndicatorSet(BaseModel):
    rsi:            Optional[float] = None
    macd_signal:    Optional[str]   = None   # "Bullish" | "Bearish" | "Neutral"
    vs_moving_avg:  Optional[str]   = None   # "Above" | "Below"
    volume_level:   Optional[str]   = None   # "High" | "Normal" | "Low"
    trend_strength: Optional[str]   = None   # "Strong" | "Moderate" | "Weak"

class AnalysisResponse(BaseModel):
    symbol:     str
    signal:     str            # "bullish" | "bearish" | "neutral"
    confidence: int            # 0–100
    indicators: IndicatorSet
    cached:     bool = False