// lib/api/backendApi.ts

import { API_CONFIG } from "@/constants/config";
import { Signal } from "@/types/stock";

// Backend returns capitalized — we normalize to lowercase Signal type
export type MACDSignal = "Bullish" | "Bearish" | "Neutral";
export type MAPosition = "Above" | "Below" | "At";
export type VolumeLevel = "High" | "Normal" | "Low";
export type TrendStrength = "Strong" | "Moderate" | "Weak";

export interface AnalysisIndicators {
  rsi: number;
  macd_signal: MACDSignal;
  vs_moving_avg: MAPosition;
  volume_level: VolumeLevel;
  trend_strength: TrendStrength;
}

export interface AnalysisResult {
  symbol: string;
  signal: Signal; // normalized lowercase
  confidence: number;
  indicators: AnalysisIndicators;
  price: number;
  change_percent: number;
}

// Raw shape from backend before normalization
interface RawAnalysisResult extends Omit<AnalysisResult, "signal"> {
  signal: "Bullish" | "Bearish" | "Neutral";
}

function normalizeSignal(raw: "Bullish" | "Bearish" | "Neutral"): Signal {
  return raw.toLowerCase() as Signal;
}

// 15 min cache per symbol
const cache = new Map<string, { data: AnalysisResult; ts: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
export async function fetchAnalysis(symbol: string): Promise<AnalysisResult> {
  const key = symbol.toUpperCase();
  const cached = cache.get(key);

  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const url = `${API_CONFIG.BACKEND_URL}/api/v1/analysis/${key}`;
  const res = await fetch(url, {
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (res.status === 404) throw new Error(`No data found for ${key}`);
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);

  const raw: RawAnalysisResult = await res.json();
  console.log('[backendApi] raw response:', JSON.stringify(raw));
  console.log('[backendApi] raw:', JSON.stringify(raw, null, 2));

  // Normalize signal to lowercase before caching
  const data: AnalysisResult = {
    ...raw,
    signal: normalizeSignal(raw.signal),
  };

  cache.set(key, { data, ts: Date.now() });
  return data;
}

export function clearAnalysisCache(symbol?: string) {
  if (symbol) cache.delete(symbol.toUpperCase());
  else cache.clear();
}