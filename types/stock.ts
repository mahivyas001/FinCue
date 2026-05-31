export type Signal = 'bullish' | 'bearish' | 'neutral';

export type Market = 'US' | 'IN';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  signal: Signal;
  confidence: number;
  market: Market;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  market: Market;
}