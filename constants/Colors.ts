// constants/colors.ts
// FinCue color palette — exported as both `Colors` (original) and `COLORS` (alias)

export const Colors = {
  primary: '#4F46E5',
  bullish: '#10B981',
  bearish: '#F43F5E',
  neutral: '#64748B',
  warning: '#F59E0B',

  // Dark mode
  darkBg: '#0F172A',
  darkCard: '#1E293B',

  // Light mode
  lightBg: '#F8FAFC',
  lightCard: '#FFFFFF',

  // Text
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textSubtle: '#64748B',

  // Chart
  chartLine: '#4F46E5',
  chartFill: 'rgba(79, 70, 229, 0.15)',
  chartGrid: 'rgba(148, 163, 184, 0.1)',
  candleUp: '#10B981',
  candleDown: '#F43F5E',
  volume: 'rgba(79, 70, 229, 0.4)',
};

// Alias — so both `import { COLORS }` and `import { Colors }` work
export const COLORS = Colors;