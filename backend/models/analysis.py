# backend/models/analysis.py

from pydantic import BaseModel
from typing import Literal

Signal = Literal["Bullish", "Bearish", "Neutral"]
SignalType = Signal
MACDSignal = Literal["Bullish", "Bearish", "Neutral"]
MAPosition = Literal["Above", "Below", "At"]
VolumeLevel = Literal["High", "Normal", "Low"]
TrendStrength = Literal["Strong", "Moderate", "Weak"]


class Indicators(BaseModel):
    rsi: float
    macd_signal: MACDSignal
    vs_moving_avg: MAPosition
    volume_level: VolumeLevel
    trend_strength: TrendStrength


class AnalysisResponse(BaseModel):
    symbol: str
    signal: Signal
    confidence: int          # 0–100
    indicators: Indicators
    price: float
    change_percent: float