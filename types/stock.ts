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

export type SignalType = 'Bullish' | 'Bearish' | 'Neutral';

export interface IndicatorData {
  rsi: number;
  macd: string;
  movingAvg: string;
  volume: string;
  trend: string;
}

export interface StockDetail {
  symbol: string;
  indicators: IndicatorData;
  beginnerExplanation: string;
  advancedExplanation: string;
  historicalNote: string;
}

export interface AVGlobalQuoteRaw {
  "01. symbol": string;
  "02. open": string;
  "03. high": string;
  "04. low": string;
  "05. price": string;
  "06. volume": string;
  "07. latest trading day": string;
  "08. previous close": string;
  "09. change": string;
  "10. change percent": string;
}

export interface AVGlobalQuoteResponse {
  "Global Quote"?: AVGlobalQuoteRaw;
  Note?: string;
  Information?: string;
}