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
    diff = macd.macd_diff().iloc[-1]   # histogram: positive = bullish crossover
    if diff > 0:   return "Bullish"
    if diff < 0:   return "Bearish"
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
    if ratio > 1.3:   return "High"
    if ratio < 0.7:   return "Low"
    return "Normal"

def _trend_strength(close: pd.Series, window: int = 14) -> str:
    """Uses ADX to measure trend strength."""
    if len(close) < window + 1:
        return "Moderate"
    # Need high/low for ADX — handled in analyze()
    return "Moderate"

def _adx_trend(df: pd.DataFrame, window: int = 14) -> str:
    try:
        adx_indicator = ta.trend.ADXIndicator(
            high=df["high"], low=df["low"], close=df["close"], window=window
        )
        adx = adx_indicator.adx().iloc[-1]
        if adx > 25:   return "Strong"
        if adx > 15:   return "Moderate"
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
    """
    score = 0

    # RSI scoring
    if rsi < 30:    score += 2    # oversold → bullish opportunity
    elif rsi < 50:  score += 1
    elif rsi > 70:  score -= 2   # overbought → bearish pressure
    elif rsi > 55:  score -= 1

    # MACD
    if macd == "Bullish":   score += 2
    elif macd == "Bearish": score -= 2

    # vs Moving Average
    if vs_ma == "Above":   score += 1
    elif vs_ma == "Below": score -= 1

    # Volume (amplifier — high volume confirms signal)
    if volume == "High" and score > 0:  score += 1
    if volume == "High" and score < 0:  score -= 1

    # Trend strength (amplifier)
    if trend == "Strong" and score > 0:  score += 1
    if trend == "Strong" and score < 0:  score -= 1

    # Map score to signal + confidence
    if score >= 3:
        signal     = "bullish"
        confidence = min(95, 60 + score * 7)
    elif score <= -3:
        signal     = "bearish"
        confidence = min(95, 60 + abs(score) * 7)
    else:
        signal     = "neutral"
        confidence = max(40, 55 - abs(score) * 5)

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