// constants/Colors.ts

import { Signal } from '@/types/stock';

export const COLORS = {
  // ── Backgrounds ─────────────────────────────────
  appBg: {
    base:     '#0A0A0A',
    card:     '#141414',
    elevated: '#1A1A1A',
    overlay:  'rgba(10, 10, 10, 0.97)',
  },
  cardBg:       '#141414',
  card2:        '#1A1A1A',

  // ── Signals ─────────────────────────────────────
  bullish:      '#A2E0FC',   // ice blue
  bearish:      '#FB7185',   // blush pink-red
  neutral:      '#94A3B8',

  // ── Signal tints ────────────────────────────────
  bullishBg:    'rgba(162, 224, 252, 0.08)',
  bullishBorder:'rgba(162, 224, 252, 0.20)',
  bearishBg:    'rgba(251, 113, 133, 0.08)',
  bearishBorder:'rgba(251, 113, 133, 0.20)',
  neutralBg:    'rgba(148, 163, 184, 0.08)',
  neutralBorder:'rgba(148, 163, 184, 0.20)',

  // ── Text ────────────────────────────────────────
  textPrimary: {
    primary: '#FFFFFF',
    muted:   '#9CA3AF',
    faint:   '#4B5563',
    dim:     '#9CA3AF',
  },
  textSub:      '#9CA3AF',
  textMuted:    '#4B5563',

  // ── Utility ─────────────────────────────────────
  white:        '#FFFFFF',
  black:        '#000000',

  // ── Border ──────────────────────────────────────
  border: {
    default: 'rgba(255, 255, 255, 0.06)',
    muted:   'rgba(255, 255, 255, 0.03)',
  },
};

// ── SignalType ────────────────────────────────────────────────────────
export type SignalType = 'Bullish' | 'Bearish' | 'Neutral';

// ── Normalize: converts backend lowercase to SignalType ────────────────
export function normalizeSignal(signal: string | undefined): SignalType {
  if (!signal) return 'Neutral';
  const s = signal.charAt(0).toUpperCase() + signal.slice(1).toLowerCase();
  if (s === 'Bullish' || s === 'Bearish' || s === 'Neutral') return s;
  return 'Neutral';
}

// ── Color helpers ──────────────────────────────────────────────────────
export function getSignalColor(signal: SignalType): string {
  switch (signal) {
    case 'Bullish': return COLORS.bullish;
    case 'Bearish': return COLORS.bearish;
    case 'Neutral': return COLORS.neutral;
  }
}

export function getSignalBg(signal: SignalType): string {
  switch (signal) {
    case 'Bullish': return COLORS.bullishBg;
    case 'Bearish': return COLORS.bearishBg;
    case 'Neutral': return COLORS.neutralBg;
  }
}

export function getSignalBorder(signal: SignalType): string {
  switch (signal) {
    case 'Bullish': return COLORS.bullishBorder;
    case 'Bearish': return COLORS.bearishBorder;
    case 'Neutral': return COLORS.neutralBorder;
  }
}

// ── Legacy functions for compatibility ─────────────────────────────────
export function signalColor(signal: Signal | string | undefined): string {
  const norm = normalizeSignal(signal as string);
  return getSignalColor(norm);
}

export function signalTint(signal: Signal | string | undefined): string {
  const norm = normalizeSignal(signal as string);
  return getSignalBg(norm);
}

export function signalLabel(signal: Signal | string | undefined): string {
  return normalizeSignal(signal as string);
}