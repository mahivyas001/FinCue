// components/insights/BehaviorInsightCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Brain, Eye, X } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { BehaviorInsight } from '@/lib/analysis/biasDetectors';

interface BehaviorInsightCardProps {
  insight: BehaviorInsight;
  isBeginnerMode?: boolean;
  onDismiss: () => void;
}

export default function BehaviorInsightCard({
  insight,
  isBeginnerMode = true,
  onDismiss,
}: BehaviorInsightCardProps) {
  const symbol = insight.symbol || '';

  // educational copies per bias detector
  const copies = {
    recency_chasing: {
      title: 'Moments of Momentum (Recency Bias)',
      beginner: `You added ${symbol} right after a >5% jump. That's a common pattern called recency bias—where we focus on recent big moves. It's helpful to pause and ask: did the company's actual value change, or just the price?`,
      advanced: `Recency Bias Detected: Watchlist add for ${symbol} followed a major short-term price movement. Chasing momentum can result in buying at local peaks. Re-evaluate your entry point relative to key support levels.`,
      icon: Brain,
    },
    compulsive_checking: {
      title: 'Mindful Monitoring (Compulsive Checking)',
      beginner: `You've viewed ${symbol} 5 times today. Checking prices constantly can make investing feel stressful and lead to hasty choices. Consider setting a daily reminder instead of checking throughout the day.`,
      advanced: `Hyper-Monitoring: 5+ intraday views on ${symbol}. High-frequency checking increases cognitive load and noise exposure. Re-anchor to your trading timeframe and avoid reactiveness.`,
      icon: Eye,
    },
    confirmation_seeking: {
      title: 'The Full Picture (Confirmation Bias)',
      beginner: `You've added 5 bullish stocks in a row. It's natural to look for positive news, but this can lead to 'confirmation bias' where we ignore warning signs. Try searching for a neutral or bearish stock to see how their metrics compare.`,
      advanced: `Asymmetry Detected: All recent additions are bullish. This pattern suggests confirmation bias. Ensure your review process includes testing the bearish thesis and reviewing counter-indicators.`,
      icon: Brain,
    },
  };

  const currentBias = copies[insight.type];
  if (!currentBias) return null;

  const IconComponent = currentBias.icon;
  const headingText = currentBias.title;
  const descriptionText = isBeginnerMode ? currentBias.beginner : currentBias.advanced;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconTextContainer}>
          <IconComponent size={16} color="#64748B" />
          <Text style={styles.title}>{headingText}</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={14} color="#64748B" />
        </TouchableOpacity>
      </View>
      <Text style={styles.content}>{descriptionText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.appBg.card,
    borderRadius:    20,
    padding:         20,
    borderWidth:     1,
    borderColor:     'rgba(100, 116, 139, 0.15)', // HSL Slate border accent
    position:        'relative',
    marginVertical:  6,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   12,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  title: {
    fontSize:      10,
    color:         '#64748B', // Neutral Slate
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily:    'Montserrat_700Bold',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    fontSize:   13,
    lineHeight: 20,
    color:      COLORS.textPrimary.primary,
    fontFamily: 'Montserrat_500Medium',
  },
});
