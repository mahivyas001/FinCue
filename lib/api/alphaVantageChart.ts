// lib/api/alphaVantageChart.ts

import { API_CONFIG } from '@/constants/config';

export interface OHLCVData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1W' | '1M' | '3M';

// In-memory chart cache (10 min TTL)
const chartCache = new Map<string, { data: OHLCVData[]; ts: number }>();
const CHART_TTL = 10 * 60 * 1000;

function sliceByTimeframe(data: OHLCVData[], timeframe: Timeframe): OHLCVData[] {
  const now = new Date();
  const cutoff = new Date();

  if (timeframe === '1W') cutoff.setDate(now.getDate() - 7);
  else if (timeframe === '1M') cutoff.setMonth(now.getMonth() - 1);
  else cutoff.setMonth(now.getMonth() - 3);

  return data.filter(d => new Date(d.date) >= cutoff);
}

export async function fetchStockChart(
  symbol: string,
  timeframe: Timeframe
): Promise<OHLCVData[]> {
  const cacheKey = `chart_${symbol}`;
  const cached = chartCache.get(cacheKey);

  if (cached && Date.now() - cached.ts < CHART_TTL) {
    return sliceByTimeframe(cached.data, timeframe);
  }

  const apiKey = process.env.EXPO_PUBLIC_AV_KEY;
  if (!apiKey) throw new Error('Alpha Vantage API key not set');

  const url = `${API_CONFIG.ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();

  if (json['Note'] || json['Information']) {
    throw new Error('RATE_LIMIT');
  }

  const series = json['Time Series (Daily)'];
  if (!series) throw new Error('No time series data');

  const data: OHLCVData[] = Object.entries(series)
    .map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'], 10),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  chartCache.set(cacheKey, { data, ts: Date.now() });
  return sliceByTimeframe(data, timeframe);
}