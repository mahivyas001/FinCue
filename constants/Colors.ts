import { Signal } from '@/types/stock';

export const Colors = {
  // ── Backgrounds ──────────────────────────────
  bg: {
    base:     '#111111',
    card:     '#1a1a1a',
    elevated: '#222222',
  },

  // ── Accent / Signal ──────────────────────────
  bullish: {
    primary: '#FFB3C6',
    tint:    '#2a1a20',  
    dim:     '#7a4a55',
  },
  bearish: {
    primary: '#93C5FD',
    tint:    '#141c2e',
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
  border:     '#1e1e1e',
  divider:    '#1e1e1e',
  icon:       '#444444',
  iconActive: '#FFB3C6',
};

// ── Signal type ───────────────────────────────
// Single source of truth is lowercase Signal from @/types/stock.
// SignalType is kept as an alias for any legacy usage — both are identical.
export type { Signal };
export type SignalType = Signal; // alias — 'bullish' | 'bearish' | 'neutral'

// ── Signal helpers ────────────────────────────
export const signalColor = (signal: Signal): string => ({
  bullish: Colors.bullish.primary,
  bearish: Colors.bearish.primary,
  neutral: Colors.neutral.primary,
}[signal] ?? Colors.neutral.primary);

export const signalTint = (signal: Signal): string => ({
  bullish: Colors.bullish.tint,
  bearish: Colors.bearish.tint,
  neutral: Colors.neutral.tint,
}[signal] ?? Colors.neutral.tint);

export const signalDim = (signal: Signal): string => ({
  bullish: Colors.bullish.dim,
  bearish: Colors.bearish.dim,
  neutral: Colors.neutral.dim,
}[signal] ?? Colors.neutral.dim);

// Display label — capitalizes for UI only
export const signalLabel = (signal: Signal): string => ({
  bullish: 'Bullish',
  bearish: 'Bearish',
  neutral: 'Neutral',
}[signal] ?? 'Neutral');

// Indicator value color
export const valueColor = (value: number | string | null): string => {
  if (value === null || value === undefined) return Colors.text.faint;
  if (typeof value === 'string') return Colors.neutral.primary;
  if (value > 0) return Colors.bullish.primary;
  if (value < 0) return Colors.bearish.primary;
  return Colors.neutral.primary;
};