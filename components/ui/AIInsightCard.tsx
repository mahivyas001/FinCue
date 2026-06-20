// components/ui/AIInsightCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SignalType, getSignalColor, signalColor, signalTint } from '@/constants/colors';
import { Signal } from '@/types/stock';
import { FONTS } from '@/constants/fonts';

interface AIInsightCardProps {
  signal:        Signal;
  confidence:    number;
  explanation:   string;
  triggers?:     string[];
  isBeginnerMode?: boolean;
  isLoading?:    boolean;
}

export default function AIInsightCard({
  signal,
  confidence,
  explanation,
  triggers = [],
  isBeginnerMode = true,
  isLoading = false,
}: AIInsightCardProps) {
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