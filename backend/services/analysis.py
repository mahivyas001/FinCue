# backend/services/analysis.py

import pandas as pd
import numpy as np
import ta
import logging
from services.market_data import fetch_daily_series
from models.schemas import AnalysisResponse, IndicatorSet
from core.cache import cache

logger = logging.getLogger(__name__)


def _rsi(close: pd.Series, period: int = 14) -> float:
    indicator = ta.momentum.RSIIndicator(close=close, window=period)
    return round(float(indicator.rsi().iloc[-1]), 2)


def _macd_signal(close: pd.Series) -> str:
    macd = ta.trend.MACD(close=close)
    diff = macd.macd_diff().iloc[-1]
    if diff > 0:  return "Bullish"
    if diff < 0:  return "Bearish"
    return "Neutral"


def _vs_moving_avg(close: pd.Series, window: int = 50) -> str:
    if len(close) < window:
        window = len(close)
    ma = close.rolling(window).mean().iloc[-1]
    return "Above" if close.iloc[-1] > ma else "Below"


def _volume_level(volume: pd.Series, window: int = 20) -> str:
    avg_vol = volume.rolling(window).mean().iloc[-1]
    latest  = volume.iloc[-1]
    ratio   = latest / avg_vol if avg_vol > 0 else 1.0
    if ratio > 1.3:  return "High"
    if ratio < 0.7:  return "Low"
    return "Normal"


def _adx_trend(df: pd.DataFrame, window: int = 14) -> str:
    try:
        adx_indicator = ta.trend.ADXIndicator(
            high=df["high"], low=df["low"], close=df["close"], window=window
        )
        adx = adx_indicator.adx().iloc[-1]
        if adx > 25:  return "Strong"
        if adx > 15:  return "Moderate"
        return "Weak"
    except Exception:
        return "Moderate"


def _compute_signal(
    rsi: float,
    macd: str,
    vs_ma: str,
    volume: str,
    trend: str,
) -> tuple[str, int]:
    """
    Deterministic signal scoring.
    AI explains this — it does NOT compute it.

    Scoring philosophy:
    - MACD + MA are primary trend signals (weighted higher)
    - RSI is a momentum/risk modifier (not a reversal signal alone)
    - Volume + Trend are confidence amplifiers
    - RSI overbought/oversold adjusts confidence, not direction
    """

    # ── Step 1: Direction score ──
    direction_score = 0

    if macd == "Bullish":   direction_score += 3
    elif macd == "Bearish": direction_score -= 3

    if vs_ma == "Above":    direction_score += 2
    elif vs_ma == "Below":  direction_score -= 2

    # ── Step 2: Signal direction ──
    if direction_score >= 3:    signal = "bullish"
    elif direction_score <= -3: signal = "bearish"
    else:                       signal = "neutral"

    # ── Step 3: Confidence ──
    base_confidence = 50

    if macd == "Bullish":             base_confidence += 15
    elif macd == "Bearish":           base_confidence += 15

    if vs_ma in ("Above", "Below"):   base_confidence += 10

    if rsi > 75:                      base_confidence -= 12
    elif rsi > 70:                    base_confidence -= 6
    elif rsi < 25:                    base_confidence -= 12
    elif rsi < 30:                    base_confidence -= 6
    elif 40 <= rsi <= 60:             base_confidence += 8

    if volume == "High":              base_confidence += 8
    elif volume == "Low":             base_confidence -= 5

    if trend == "Strong":             base_confidence += 10
    elif trend == "Weak":             base_confidence -= 8

    if signal == "neutral":           base_confidence -= 10

    confidence = max(25, min(95, base_confidence))
    return signal, int(confidence)


def analyze(symbol: str) -> AnalysisResponse:
    cache_key = f"analysis:{symbol}"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info(f"[Cache HIT] analysis for {symbol}")
        cached.cached = True
        return cached

    logger.info(f"[Analysis] Computing for {symbol}")
    df = fetch_daily_series(symbol)

    rsi        = _rsi(df["close"])
    macd       = _macd_signal(df["close"])
    vs_ma      = _vs_moving_avg(df["close"])
    volume     = _volume_level(df["volume"])
    trend      = _adx_trend(df)
    signal, confidence = _compute_signal(rsi, macd, vs_ma, volume, trend)

    result = AnalysisResponse(
        symbol=symbol,
        signal=signal,
        confidence=confidence,
        indicators=IndicatorSet(
            rsi=rsi,
            macd_signal=macd,
            vs_moving_avg=vs_ma,
            volume_level=volume,
            trend_strength=trend,
        ),
        cached=False,
    )

    cache.set(cache_key, result)
    return result