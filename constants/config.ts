export const API_CONFIG = {
  ALPHA_VANTAGE_BASE_URL: "https://www.alphavantage.co/query",
  ALPHA_VANTAGE_KEY: process.env.EXPO_PUBLIC_AV_KEY ?? "",
  CACHE_TTL: 5 * 60 * 1000,
  QUOTE_CACHE_TTL_MS: 5 * 60 * 1000,
  RATE_LIMIT_DELAY: 500,
  BACKEND_URL: "https://web-production-d01ce.up.railway.app",
} as const;