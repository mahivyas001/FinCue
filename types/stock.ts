// ─────────────────────────────────────────────
// FinCue — Shared Stock Types
// ─────────────────────────────────────────────
// Single source of truth for all stock-related
// shapes across the app.
// ─────────────────────────────────────────────

export type Signal = "bullish" | "bearish" | "neutral";
export type Market = "US" | "IN";

// ── Core stock shape ──────────────────────────
// Used in HomeScreen, WatchlistScreen, StockCard
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  market: Market;
  signal: Signal;
  confidence: number;
}

// ── Per-indicator shape ───────────────────────
export interface IndicatorData {
  rsi: number;
  macd: Signal;
  movingAvg: "above" | "below";
  volume: "high" | "normal" | "low";
  trend: "strong" | "moderate" | "weak";
}

// ── Full detail shape (StockDetailScreen) ─────
export interface StockDetail {
  symbol: string;
  indicators: IndicatorData;
  beginnerExplanation: string;
  advancedExplanation: string;
  historicalNote: string;
}

// ── Alpha Vantage raw API response ────────────
// Only the fields we actually use from
// the GLOBAL_QUOTE endpoint.
export interface AVGlobalQuoteRaw {
  "01. symbol": string;
  "02. open": string;
  "05. price": string;
  "09. change": string;
  "10. change percent": string;
  "06. volume": string;
}

export interface AVGlobalQuoteResponse {
  "Global Quote": AVGlobalQuoteRaw;
}