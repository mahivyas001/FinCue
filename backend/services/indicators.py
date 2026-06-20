# backend/services/indicators.py

import pandas as pd
import numpy as np
import ta
from models.analysis import (
    SignalType, Indicators, MACDSignal,
    MAPosition, VolumeLevel, TrendStrength
)


def compute_indicators(df: pd.DataFrame) -> Indicators:
    close = df["close"]
    volume = df["volume"]

    # ── RSI (14) ──────────────────────────────────────────
    rsi_series = ta.momentum.RSIIndicator(close=close, window=14).rsi()
    rsi = round(float(rsi_series.iloc[-1]), 2)

    # ── MACD ──────────────────────────────────────────────
    macd_obj = ta.trend.MACD(close=close)
    macd_line = macd_obj.macd().iloc[-1]
    signal_line = macd_obj.macd_signal().iloc[-1]

    if macd_line > signal_line:
        macd_signal: MACDSignal = "Bullish"
    elif macd_line < signal_line:
        macd_signal = "Bearish"
    else:
        macd_signal = "Neutral"

    # ── 50-day Moving Average ─────────────────────────────
    ma50 = close.rolling(window=50).mean().iloc[-1]
    current_price = close.iloc[-1]

    diff_pct = (current_price - ma50) / ma50 * 100
    if diff_pct > 1.0:
        vs_ma: MAPosition = "Above"
    elif diff_pct < -1.0:
        vs_ma = "Below"
    else:
        vs_ma = "At"

    # ── Volume (vs 20-day avg) ────────────────────────────
    avg_volume = volume.rolling(window=20).mean().iloc[-1]
    vol_ratio = volume.iloc[-1] / avg_volume if avg_volume else 1.0

    if vol_ratio > 1.3:
        vol_level: VolumeLevel = "High"
    elif vol_ratio < 0.7:
        vol_level = "Low"
    else:
        vol_level = "Normal"

    # ── Trend Strength (ADX) ──────────────────────────────
    adx_series = ta.trend.ADXIndicator(
        high=df["high"], low=df["low"], close=close, window=14
    ).adx()
    adx = float(adx_series.iloc[-1])

    if adx >= 30:
        trend: TrendStrength = "Strong"
    elif adx >= 20:
        trend = "Moderate"
    else:
        trend = "Weak"

    return Indicators(
        rsi=rsi,
        macd_signal=macd_signal,
        vs_moving_avg=vs_ma,
        volume_level=vol_level,
        trend_strength=trend,
    )


def compute_signal(indicators: Indicators, rsi: float) -> tuple[SignalType, int]:
    """
    Score each indicator and derive overall signal + confidence.
    Bullish = +1, Bearish = -1, Neutral = 0
    """
    scores = []

    # RSI
    if rsi < 30:
        scores.append(1)    # oversold → bullish
    elif rsi > 70:
        scores.append(-1)   # overbought → bearish
    else:
        scores.append(0)

    # MACD
    scores.append(1 if indicators.macd_signal == "Bullish"
                  else -1 if indicators.macd_signal == "Bearish" else 0)

    # vs MA
    scores.append(1 if indicators.vs_moving_avg == "Above"
                  else -1 if indicators.vs_moving_avg == "Below" else 0)

    # Volume (amplifier — High = stronger trend, Low = weaker)
    scores.append(0.5 if indicators.volume_level == "High"
                  else -0.5 if indicators.volume_level == "Low" else 0)

    total = sum(scores)
    max_possible = 3.5

    if total > 0.5:
        signal: Signal = "Bullish"
    elif total < -0.5:
        signal = "Bearish"
    else:
        signal = "Neutral"

    # Confidence: how far from 0 relative to max
    confidence = int(min(abs(total) / max_possible * 100, 99))

    # Trend strength boosts confidence
    if indicators.trend_strength == "Strong":
        confidence = min(confidence + 10, 99)
    elif indicators.trend_strength == "Weak":
        confidence = max(confidence - 10, 10)

    return signal, confidence