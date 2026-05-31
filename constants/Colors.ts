// constants/colors.ts

export const Colors = {
  primary: {
    main:  '#A2E0FC',
    light: '#C8EDFD',
    dark:  '#7DD3F8',
    tint:  'rgba(162, 224, 252, 0.10)',
  },
  bullish: {
    primary: '#A2E0FC',
    tint:    'rgba(162, 224, 252, 0.10)',
    text:    '#C8EDFD',
  },
  bearish: {
    primary: '#FB7185',
    tint:    'rgba(251, 113, 133, 0.10)',
    text:    '#FCA5A5',
  },
  neutral: {
    primary: '#6B7280',
    tint:    'rgba(107, 114, 128, 0.10)',
    text:    '#9CA3AF',
  },
  bg: {
    base:     '#0A0A0A',
    card:     '#111111',
    elevated: '#1A1A1A',
    overlay:  'rgba(10, 10, 10, 0.97)',
  },
  text: {
    primary: '#FFFFFF',
    muted:   '#AAAAAA',
    faint:   '#555555',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.06)',
    muted:   'rgba(255, 255, 255, 0.03)',
  },
  chart: {
    bullish: '#A2E0FC',
    bearish: '#FB7185',
    neutral: '#6B7280',
    grid:    'rgba(255, 255, 255, 0.04)',
  },
};

export type Signal = 'bullish' | 'bearish' | 'neutral';

export function signalColor(signal: Signal): string {
  switch (signal) {
    case 'bullish': return Colors.bullish.primary;
    case 'bearish': return Colors.bearish.primary;
    default:        return Colors.neutral.primary;
  }
}

export function signalTint(signal: Signal): string {
  switch (signal) {
    case 'bullish': return Colors.bullish.tint;
    case 'bearish': return Colors.bearish.tint;
    default:        return Colors.neutral.tint;
  }
}

export function signalLabel(signal: Signal): string {
  switch (signal) {
    case 'bullish': return 'Bullish';
    case 'bearish': return 'Bearish';
    default:        return 'Neutral';
  }
}

export function valueColor(value: number | null): string {
  if (value === null) return Colors.neutral.text;
  if (value > 0)      return Colors.bullish.text;
  if (value < 0)      return Colors.bearish.text;
  return Colors.neutral.text;
}