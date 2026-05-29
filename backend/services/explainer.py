import anthropic
import os
from models.analysis import AnalysisResponse

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

BEGINNER_PROMPT = """You are a friendly stock market assistant helping beginner investors understand technical analysis.

The backend has calculated these indicators for {symbol}:
- Overall Signal: {signal}
- Confidence: {confidence}%
- RSI (14): {rsi} — {rsi_label}
- MACD: {macd}
- vs 50-day Moving Average: {ma}
- Volume Level: {volume}
- Trend Strength: {trend}

Explain what this means in 2-3 simple sentences. Use plain English. No jargon.
Do NOT predict the future or guarantee any outcome.
Do NOT use the words BUY or SELL.
End with one short educational tip about what the user should watch next."""

ADVANCED_PROMPT = """You are a technical analysis assistant summarizing indicator data for an experienced trader.

Computed indicators for {symbol}:
- Signal: {signal} | Confidence: {confidence}%
- RSI(14): {rsi} ({rsi_label})
- MACD: {macd}
- MA50: {ma}
- Volume: {volume}
- Trend Strength: {trend}

Write a concise 2-3 sentence technical summary. Use proper trading terminology.
Do NOT predict future price or guarantee outcomes.
Do NOT use the words BUY or SELL. Use Bullish / Bearish / Neutral instead."""

_cache: dict[str, str] = {}

def _cache_key(symbol: str, mode: str) -> str:
    return f"{symbol.upper()}:{mode}"

def get_cached_explanation(symbol: str, mode: str) -> str | None:
    return _cache.get(_cache_key(symbol, mode))

def set_cached_explanation(symbol: str, mode: str, text: str) -> None:
    _cache[_cache_key(symbol, mode)] = text

def build_prompt(symbol: str, mode: str, data: AnalysisResponse) -> str:
    rsi_val = data.indicators.rsi
    if rsi_val >= 70:
        rsi_label = "overbought zone"
    elif rsi_val <= 30:
        rsi_label = "oversold zone"
    else:
        rsi_label = "neutral zone"

    params = {
        "symbol": symbol.upper(),
        "signal": data.signal,
        "confidence": data.confidence,
        "rsi": round(rsi_val, 2),
        "rsi_label": rsi_label,
        "macd": data.indicators.macd_signal,
        "ma": data.indicators.vs_moving_avg,
        "volume": data.indicators.volume_level,
        "trend": data.indicators.trend_strength,
    }

    template = BEGINNER_PROMPT if mode == "beginner" else ADVANCED_PROMPT
    return template.format(**params)

async def generate_explanation(symbol: str, mode: str, data: AnalysisResponse) -> str:
    cached = get_cached_explanation(symbol, mode)
    if cached:
        return cached

    prompt = build_prompt(symbol, mode, data)

    message = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )

    text = message.content[0].text.strip()
    set_cached_explanation(symbol, mode, text)
    return text