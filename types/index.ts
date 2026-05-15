export type Signal = "bullish" | "bearish" | "neutral";
export type MarketType = "US" | "IN";
export type UserMode = "beginner" | "advanced";

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  market: MarketType;
  signal: Signal;
  confidence: number;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: string;
}
