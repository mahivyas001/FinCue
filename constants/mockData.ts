import type { Stock, IndicatorData, StockDetail } from "@/types/stock";

export const MOCK_STOCKS: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.5,
    change: 2.3,
    changePercent: 1.23,
    market: "US",
    signal: "bullish",
    confidence: 78,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 242.1,
    change: -4.7,
    changePercent: -1.9,
    market: "US",
    signal: "bearish",
    confidence: 65,
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    price: 2847.0,
    change: 12.5,
    changePercent: 0.44,
    market: "IN",
    signal: "neutral",
    confidence: 52,
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd.",
    price: 1456.0,
    change: 28.9,
    changePercent: 2.02,
    market: "IN",
    signal: "bullish",
    confidence: 71,
  },
];

export const MOCK_STOCK_DETAILS: Record<string, StockDetail> = {
  AAPL: {
    symbol: "AAPL",
    indicators: {
      rsi: 62,
      macd: "bullish",
      movingAvg: "above",
      volume: "high",
      trend: "strong",
    },
    beginnerExplanation:
      "Apple is showing strong buying interest right now. More people are buying the stock than selling it, and it's been climbing steadily. This kind of momentum often continues in the short term, but markets can always surprise you.",
    advancedExplanation:
      "RSI at 62 — approaching overbought but still has room. MACD crossover confirmed bullish momentum. Price trading above 20-day and 50-day MA. Volume spike suggests institutional accumulation. Watch for resistance near 195.",
    historicalNote:
      "In the last 4 similar setups, AAPL averaged a 3.2% gain over the following 10 trading days.",
  },
  TSLA: {
    symbol: "TSLA",
    indicators: {
      rsi: 38,
      macd: "bearish",
      movingAvg: "below",
      volume: "normal",
      trend: "moderate",
    },
    beginnerExplanation:
      "Tesla is under some selling pressure right now. The stock has been declining and sellers are in control. This doesn't mean it won't recover, but the current signals suggest caution.",
    advancedExplanation:
      "RSI at 38 — approaching oversold. MACD bearish crossover still active. Price below both 20-day and 50-day MA. Volume is average — no panic selling yet. Potential support zone around 235.",
    historicalNote:
      "In the last 3 similar setups, TSLA took an average of 8 trading days before finding a stable support level.",
  },
  RELIANCE: {
    symbol: "RELIANCE",
    indicators: {
      rsi: 51,
      macd: "neutral",
      movingAvg: "above",
      volume: "normal",
      trend: "weak",
    },
    beginnerExplanation:
      "Reliance Industries is in a holding pattern right now — neither strongly up nor down. The stock is taking a breather after recent moves. This can be normal before the next directional move.",
    advancedExplanation:
      "RSI at 51 — perfectly neutral. MACD near zero line with no clear crossover. Price marginally above 20-day MA. Low trend strength suggests consolidation phase. Watch for breakout above 2870 or breakdown below 2820.",
    historicalNote:
      "Neutral consolidation phases for Reliance have historically resolved upward 60% of the time over a 2-week window.",
  },
  INFY: {
    symbol: "INFY",
    indicators: {
      rsi: 67,
      macd: "bullish",
      movingAvg: "above",
      volume: "high",
      trend: "strong",
    },
    beginnerExplanation:
      "Infosys is gaining momentum with strong buyer interest. The stock is trending upward and volume is picking up, which suggests confidence from larger investors.",
    advancedExplanation:
      "RSI at 67 — bullish but watch for overbought above 70. MACD bullish with widening histogram. Price well above both MAs. High volume confirms breakout validity. Next target zone around 1490-1500.",
    historicalNote:
      "In 5 of the last 6 similar setups, INFY continued upward for at least 5 more trading days.",
  },
};