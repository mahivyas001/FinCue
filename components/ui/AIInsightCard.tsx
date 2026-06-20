// components/ui/AIInsightCard.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SignalType, getSignalColor, signalColor, signalTint } from '@/constants/colors';
import { Signal } from '@/types/stock';
import { FONTS } from '@/constants/fonts';
import { useAppStore } from '@/store/useAppStore';
import { QUIZ_BANK } from '@/constants/quizBank';
import ReasoningQuiz from './ReasoningQuiz';

interface AIInsightCardProps {
  signal:        Signal;
  confidence:    number;
  explanation:   string;
  triggers?:     string[];
  isBeginnerMode?: boolean;
  isLoading?:    boolean;
  symbol?:       string;
  rsi?:          number | null;
  macdSignal?:   string;
  maVsLabel?:    string;
  volLabel?:     string;
}

export default function AIInsightCard({
  signal,
  confidence,
  explanation,
  triggers = [],
  isBeginnerMode = true,
  isLoading = false,
  symbol,
  rsi,
  macdSignal,
  maVsLabel,
  volLabel,
}: AIInsightCardProps) {
  const [revealed, setRevealed] = useState(false);
  const quizzesEnabled = useAppStore((s) => s.quizzesEnabled);

  useEffect(() => {
    setRevealed(false);
  }, [symbol, signal]);
  const color = signalColor(signal);
  const tint  = signalTint(signal);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={[styles.shimmer, { width: '40%', marginBottom: 16 }]} />
        <View style={[styles.shimmer, { width: '100%', marginBottom: 8 }]} />
        <View style={[styles.shimmer, { width: '100%', marginBottom: 8 }]} />
        <View style={[styles.shimmer, { width: '70%' }]} />
      </View>
    );
  }

  // Match quiz
  let quizKey: string | null = null;
  if (rsi !== null && rsi !== undefined) {
    if (rsi > 70) quizKey = 'rsi_overbought';
    else if (rsi < 30) quizKey = 'rsi_oversold';
  }
  if (!quizKey && macdSignal) {
    if (macdSignal === 'Bullish') quizKey = 'macd_bullish';
    else if (macdSignal === 'Bearish') quizKey = 'macd_bearish';
  }
  if (!quizKey && volLabel === 'High') {
    quizKey = 'volume_spike';
  }
  if (!quizKey && maVsLabel) {
    if (maVsLabel === 'Above') quizKey = 'ma50_above';
    else if (maVsLabel === 'Below') quizKey = 'ma50_below';
  }

  const quizEntry = quizKey ? QUIZ_BANK[quizKey] : null;
  const showQuiz = !!(quizzesEnabled && !revealed && quizEntry);
  const modeKey = isBeginnerMode ? 'beginner' : 'advanced';
  const quizVariant = quizEntry ? quizEntry[modeKey] : null;

  return (
    <View style={[styles.card, { borderColor: color + '30', borderWidth: 1 }]}>

      {/* Label row — small and secondary */}
      <View style={styles.labelRow}>
        <Text style={styles.sectionLabel}>
          {isBeginnerMode ? 'AI Insight' : 'AI Analysis'}
        </Text>
        <View style={[styles.confidencePill, { backgroundColor: tint }]}>
          <Text style={[styles.confidenceText, { color }]}>
            {confidence}% confident
          </Text>
        </View>
      </View>

      {showQuiz && quizVariant && quizEntry ? (
        <ReasoningQuiz
          question={quizVariant.question}
          options={quizVariant.options}
          correctOptionId={quizVariant.correctOptionId}
          explanation={quizVariant.explanation}
          onAnswered={() => setRevealed(true)}
        />
      ) : (
        <>
          {/* Explanation — HERO, big and prominent */}
          <Text style={styles.explanationHero}>{explanation}</Text>

          {/* Triggers checklist */}
          {triggers.length > 0 && (
            <View style={styles.triggerList}>
              {triggers.map((t, i) => (
                <View key={i} style={styles.triggerRow}>
                  <View style={[styles.checkCircle, { backgroundColor: tint }]}>
                    <Text style={[styles.checkMark, { color }]}>✓</Text>
                  </View>
                  <Text style={styles.triggerText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {/* Bottom disclaimer */}
      <Text style={styles.disclaimer}>
        This is not financial advice. AI interprets data only.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.appBg.card,
    borderRadius:    20,
    padding:         20,
  },
  labelRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   16,
  },
  sectionLabel: {
    fontSize:      10,
    color:         COLORS.textPrimary.faint,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily:    'Montserrat_600SemiBold',
  },
  confidencePill: {
    paddingVertical:   4,
    paddingHorizontal: 12,
    borderRadius:      100,
  },
  confidenceText: {
    fontSize:   12,
    fontFamily: 'Montserrat_600SemiBold',
  },

  // ── HERO explanation ──────────────────────
  explanationHero: {
    fontSize:    20,
    lineHeight:  30,
    color:       COLORS.textPrimary.primary,
    fontFamily:  'Montserrat_600SemiBold',
    marginBottom: 20,
    letterSpacing: -0.3,
  },

  triggerList: {
    gap:          8,
    marginBottom: 16,
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  checkCircle: {
    width:          18,
    height:         18,
    borderRadius:   9,
    alignItems:     'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize:   10,
    fontFamily: 'Montserrat_700Bold',
  },
  triggerText: {
    fontSize:   13,
    color:      COLORS.textPrimary.muted,
    fontFamily: 'Montserrat_400Regular',
    flex:       1,
    lineHeight: 18,
  },
  disclaimer: {
    fontSize:   10,
    color:      COLORS.textPrimary.faint,
    fontFamily: 'Montserrat_400Regular',
    marginTop:  4,
  },
  shimmer: {
    height:          14,
    borderRadius:    7,
    backgroundColor: COLORS.appBg.elevated,
    marginBottom:    8,
  },
});