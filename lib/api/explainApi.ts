import { API_CONFIG } from '@/constants/config';
export type ExplanationResponse = {
  symbol: string;
  mode: string;
  explanation: string;
};

const cache: Record<string, { data: ExplanationResponse; ts: number }> = {};
const TTL = 15 * 60 * 1000;

export async function fetchExplanation(
  symbol: string,
  mode: 'beginner' | 'advanced'
): Promise<ExplanationResponse> {
  const key = `${symbol.toUpperCase()}:${mode}`;
  const cached = cache[key];
  if (cached && Date.now() - cached.ts < TTL) return cached.data;

const res = await fetch(
  `${API_CONFIG.BACKEND_URL}/api/v1/explain/${symbol.toUpperCase()}?mode=${mode}`
  // no method needed, GET is default
);

  if (res.status === 429) throw new Error('Rate limit hit. Try again in a minute.');
  if (res.status === 404) throw new Error(`${symbol} not found.`);
  if (!res.ok) throw new Error('Explanation unavailable.');

  const data: ExplanationResponse = await res.json();
  cache[key] = { data, ts: Date.now() };
  return data;
}

export function clearExplanationCache(symbol?: string) {
  if (!symbol) {
    Object.keys(cache).forEach(k => delete cache[k]);
  } else {
    ['beginner', 'advanced'].forEach(m => delete cache[`${symbol.toUpperCase()}:${m}`]);
  }
}