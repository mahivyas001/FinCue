// ─────────────────────────────────────────────
// FinCue — API Configuration
// ─────────────────────────────────────────────
// Store your key in .env as EXPO_PUBLIC_AV_KEY
// Never commit the actual key to git.
// ─────────────────────────────────────────────

export const API_CONFIG = {
  ALPHA_VANTAGE_BASE_URL: "https://www.alphavantage.co/query",

  // Expo exposes env vars prefixed with EXPO_PUBLIC_ to the client bundle.
  // Add this to your .env file:  EXPO_PUBLIC_AV_KEY=your_key_here
  ALPHA_VANTAGE_KEY: process.env.EXPO_PUBLIC_AV_KEY ?? "",

  // Free tier: 25 req/day, 5 req/min.
  // Cache quotes for 5 minutes so repeated renders
  // don't burn the daily quota.
  QUOTE_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
} as const;