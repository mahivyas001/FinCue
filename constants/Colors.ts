export const Colors = {
  // ── Backgrounds ──────────────────────────────
  bg: {
    base: '#111111',
    card: '#1a1a1a',
    elevated: '#222222',
  },

  // ── Accent / Signal ──────────────────────────
  bullish: {
    primary: '#FFB3C6',
    tint:    '#2a1a1e',
    dim:     '#7a4a55',
  },
  bearish: {
    primary: '#93C5FD',
    tint:    '#161e2e',
    dim:     '#3a5070',
  },
  neutral: {
    primary: '#555555',
    tint:    '#1a1a1a',
    dim:     '#444444',
  },

  // ── Text ─────────────────────────────────────
  text: {
    primary:   '#FFFFFF',
    secondary: '#AAAAAA',
    muted:     '#888888',
    dim:       '#555555',
    faint:     '#444444',
    highlight: '#DDDDDD',
  },

  // ── UI ───────────────────────────────────────
  border:   '#1e1e1e',
  divider:  '#1e1e1e',
  icon:     '#444444',
  iconActive: '#FFB3C6',
};

// Signal helpers — use these everywhere instead of inline conditionals
export type SignalType = 'Bullish' | 'Bearish' | 'Neutral';

export const signalColor = (signal: SignalType) => ({
  Bullish: Colors.bullish.primary,
  Bearish: Colors.bearish.primary,
  Neutral: Colors.neutral.primary,
}[signal]);

export const signalTint = (signal: SignalType) => ({
  Bullish: Colors.bullish.tint,
  Bearish: Colors.bearish.tint,
  Neutral: Colors.neutral.tint,
}[signal]);

export const signalDim = (signal: SignalType) => ({
  Bullish: Colors.bullish.dim,
  Bearish: Colors.bearish.dim,
  Neutral: Colors.neutral.dim,
}[signal]);

// Indicator value color — positive → bullish pink, negative → bearish blue, zero/text → dim
export const valueColor = (value: number | string | null): string => {
  if (value === null || value === undefined) return Colors.text.faint;
  if (typeof value === 'string') return Colors.neutral.primary;
  if (value > 0) return Colors.bullish.primary;
  if (value < 0) return Colors.bearish.primary;
  return Colors.neutral.primary;
};