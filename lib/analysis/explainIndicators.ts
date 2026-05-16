// lib/analysis/explainIndicators.ts
// Generates dynamic explanations from real indicator values.
// No AI API needed — deterministic logic based on real data.
// Can be swapped for Claude API later with zero changes to UI.

import { Signal } from "@/types/stock";

export interface IndicatorInput {
  symbol: string;
  signal: Signal;
  confidence: number;
  rsi: number;
  macd: string;
  movingAvg: string;
  volume: string;
  trend: string;
}

// ── RSI interpretation ────────────────────────
function explainRSI(rsi: number, symbol: string, mode: "beginner" | "advanced"): string {
  if (mode === "beginner") {
    if (rsi > 70) return `${symbol} has been bought heavily recently (RSI: ${rsi.toFixed(1)}), which sometimes means the price may cool down soon.`;
    if (rsi < 30) return `The stock has been under significant selling pressure (RSI: ${rsi.toFixed(1)}), which sometimes signals a potential recovery.`;
    if (rsi > 55) return `Buying momentum is building steadily (RSI: ${rsi.toFixed(1)}), showing more buyers than sellers recently.`;
    if (rsi < 45) return `Sellers have had the upper hand recently (RSI: ${rsi.toFixed(1)}), keeping the price under pressure.`;
    return `The stock is in a balanced zone (RSI: ${rsi.toFixed(1)}), with neither buyers nor sellers in clear control.`;
  } else {
    if (rsi > 70) return `RSI at ${rsi.toFixed(2)} — overbought territory, watch for mean reversion.`;
    if (rsi < 30) return `RSI at ${rsi.toFixed(2)} — oversold, potential bounce setup forming.`;
    if (rsi > 55) return `RSI at ${rsi.toFixed(2)} — bullish momentum building, trend intact.`;
    if (rsi < 45) return `RSI at ${rsi.toFixed(2)} — bearish pressure, below midline.`;
    return `RSI at ${rsi.toFixed(2)} — neutral zone, no directional bias.`;
  }
}

// ── Signal summary ────────────────────────────
function explainSignal(
  signal: Signal,
  confidence: number,
  mode: "beginner" | "advanced"
): string {
  const conf =
    confidence > 75 ? "strong" : confidence > 50 ? "moderate" : "weak";

  if (mode === "beginner") {
    if (signal === "bullish")
      return `Overall, the indicators are leaning ${conf}ly positive for this stock right now.`;
    if (signal === "bearish")
      return `Overall, the indicators are showing ${conf} caution signals for this stock.`;
    return `The indicators are mixed, with no clear direction at the moment.`;
  } else {
    if (signal === "bullish")
      return `Composite signal: Bullish with ${confidence}% confidence.`;
    if (signal === "bearish")
      return `Composite signal: Bearish with ${confidence}% confidence.`;
    return `Composite signal: Neutral — ${confidence}% confidence, consolidation phase.`;
  }
}

// ── MACD + MA + Volume + Trend context ────────
function explainContext(
  data: IndicatorInput,
  mode: "beginner" | "advanced"
): string {
  const parts: string[] = [];

  if (mode === "beginner") {
    // MACD
    if (data.macd.toLowerCase() === "bullish")
      parts.push("Short-term momentum is picking up");
    else if (data.macd.toLowerCase() === "bearish")
      parts.push("Short-term momentum is slowing down");

    // Moving average
    if (data.movingAvg.toLowerCase().includes("above"))
      parts.push("the stock is trading above its recent average price");
    else if (data.movingAvg.toLowerCase().includes("below"))
      parts.push("the stock is trading below its recent average price");

    // Volume
    if (data.volume.toLowerCase() === "high")
      parts.push("with strong participation from investors");
    else if (data.volume.toLowerCase() === "low")
      parts.push("though trading activity is relatively quiet");

    // Trend
    if (data.trend.toLowerCase() === "strong")
      parts.push("and the overall trend is well established");
    else if (data.trend.toLowerCase() === "weak")
      parts.push("but the trend lacks conviction");

  } else {
    // Advanced
    if (data.macd.toLowerCase() === "bullish")
      parts.push(`MACD bullish crossover confirmed`);
    else if (data.macd.toLowerCase() === "bearish")
      parts.push(`MACD bearish crossover active`);

    if (data.movingAvg.toLowerCase().includes("above"))
      parts.push("price above MA50");
    else if (data.movingAvg.toLowerCase().includes("below"))
      parts.push("price below MA50");

    if (data.volume.toLowerCase() === "high")
      parts.push("volume elevated");
    else if (data.volume.toLowerCase() === "low")
      parts.push("volume subdued");

    if (data.trend.toLowerCase() === "strong")
      parts.push("ADX confirms strong trend");
    else if (data.trend.toLowerCase() === "weak")
      parts.push("ADX weak — low trend conviction");
    else
      parts.push("ADX moderate");
  }

  if (parts.length === 0) return "";
  if (mode === "beginner") return parts.join(", ") + ".";
  return parts.join(" · ") + ".";
}

// ── Disclaimer ────────────────────────────────
function disclaimer(mode: "beginner" | "advanced"): string {
  if (mode === "beginner")
    return "Remember: past signals don't guarantee future results. Always do your own research.";
  return "Not financial advice. Verify with additional confluence.";
}

// ── Main export ───────────────────────────────
export function generateExplanation(
  data: IndicatorInput,
  mode: "beginner" | "advanced"
): string {
  const signal = explainSignal(data.signal, data.confidence, mode);
  const rsi = explainRSI(data.rsi, data.symbol, mode);  const context = explainContext(data, mode);
  const disc = disclaimer(mode);

  if (mode === "beginner") {
    return `${signal} ${rsi} ${context} ${disc}`.trim();
  } else {
    return `${signal} ${rsi} ${context} ${disc}`.trim();
  }
}