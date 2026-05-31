# backend/services/explanation.py

import anthropic
import logging
from core.config import settings
from core.cache import cache
from services.analysis import analyze

logger = logging.getLogger(__name__)

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

BEGINNER_PROMPT = """You are FinCue's AI assistant. Your job is to explain stock analysis results in simple, friendly English for beginner investors.

Here is the technical analysis for {symbol}:
- Signal: {signal} (overall direction)
- Confidence: {confidence}%
- RSI (14): {rsi} — measures if the stock is overbought or oversold (above 70 = overbought, below 30 = oversold)
- MACD: {macd} — measures momentum direction
- vs 50-day Moving Average: {vs_ma} — is the price above or below its recent trend line
- Volume: {volume} — how much trading activity compared to normal
- Trend Strength (ADX): {trend} — how strong the current trend is

Write a 2-3 sentence explanation in plain English. Avoid all jargon. Do NOT use the words RSI, MACD, ADX, or any technical terms. Do NOT recommend buying or selling. Do NOT promise any outcomes. Use words like "appears", "suggests", "may". Be warm and educational."""

ADVANCED_PROMPT = """You are FinCue's AI assistant providing technical analysis summaries for experienced traders.

Technical analysis for {symbol}:
- Signal: {signal}
- Confidence: {confidence}%
- RSI (14): {rsi}
- MACD Signal: {macd}
- Price vs MA50: {vs_ma}
- Volume vs 20-day avg: {volume}
- ADX Trend Strength: {trend}

Write a concise 2-3 sentence technical summary. Use proper trading terminology. Reference specific indicator values where relevant. Do NOT recommend buying or selling. Do NOT promise outcomes. Use language like "suggests", "indicates", "may signal"."""


def _build_prompt(symbol: str, mode: str) -> str:
    analysis = analyze(symbol)
    ind = analysis.indicators

    template = BEGINNER_PROMPT if mode == "beginner" else ADVANCED_PROMPT

    return template.format(
        symbol=symbol,
        signal=analysis.signal.capitalize(),
        confidence=analysis.confidence,
        rsi=ind.rsi,
        macd=ind.macd_signal,
        vs_ma=ind.vs_moving_avg,
        volume=ind.volume_level,
        trend=ind.trend_strength,
    )


def explain(symbol: str, mode: str) -> str:
    cache_key = f"explain:{symbol}:{mode}"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info(f"[Cache HIT] explanation for {symbol} ({mode})")
        return cached

    logger.info(f"[Explain] Generating for {symbol} ({mode})")
    prompt = _build_prompt(symbol, mode)

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )

    explanation = message.content[0].text.strip()
    cache.set(cache_key, explanation)
    return explanation