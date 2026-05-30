export const Colors = {
  primary: {
    main:  '#93C5FD',
    light: '#BFDBFE',
    dark:  '#60A5FA',
    tint:  'rgba(147, 197, 253, 0.10)',
  },
  bullish: {
    primary: '#93C5FD',
    tint:    'rgba(147, 197, 253, 0.10)',
    text:    '#BFDBFE',
  },
  bearish: {
    primary: '#FDA4AF',
    tint:    'rgba(253, 164, 175, 0.10)',
    text:    '#FECDD3',
  },
  neutral: {
    primary: '#6B7280',
    tint:    'rgba(107, 114, 128, 0.10)',
    text:    '#9CA3AF',
  },
  bg: {
    base:     '#09090F',
    card:     '#111117',
    elevated: '#18181F',
    overlay:  'rgba(9, 9, 15, 0.97)',
  },
  text: {
    primary: '#FFFFFF',
    muted:   '#6B7280',
    faint:   '#374151',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.06)',
    muted:   'rgba(255, 255, 255, 0.03)',
  },
  chart: {
    bullish: '#60A5FA',
    bearish: '#F472B6',
    neutral: '#6B7280',
    grid:    'rgba(255, 255, 255, 0.04)',
  },
  pink: {
    primary: '#FDA4AF',
    light:   '#FECDD3',
    tint:    'rgba(253, 164, 175, 0.10)',
  },
  blue: {
    primary: '#93C5FD',
    light:   '#BFDBFE',
    tint:    'rgba(147, 197, 253, 0.10)',
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