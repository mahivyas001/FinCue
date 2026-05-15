import { Stock } from "@/types";

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
