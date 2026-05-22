import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, SignalType, signalColor, signalTint } from '@/constants/colors';

interface AIInsightCardProps {
  signal: SignalType;
  confidence: number;
  explanation: string;       // main body copy
  triggers?: string[];       // checklist items
  isBeginnerMode?: boolean;
  isLoading?: boolean;
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
        <View style={[styles.shimmer, { width: '40%', marginBottom: 10 }]} />
        <View style={[styles.shimmer, { width: '100%', marginBottom: 6 }]} />
        <View style={[styles.shimmer, { width: '85%' }]} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>
          {isBeginnerMode ? 'AI Insight' : 'AI Analysis'}
        </Text>
        <View style={[styles.confidencePill, { backgroundColor: tint }]}>
          <Text style={[styles.confidenceText, { color }]}>
            {confidence}% confident
          </Text>
        </View>
      </View>

      {/* Body */}
      <Text style={styles.body}>{explanation}</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius:    16,
    padding:         16,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   10,
  },
  sectionLabel: {
    fontSize:      10,
    color:         Colors.text.faint,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  confidencePill: {
    paddingVertical:   3,
    paddingHorizontal: 10,
    borderRadius:      100,
  },
  confidenceText: {
    fontSize:   12,
    fontWeight: '500',
  },
  body: {
    fontSize:    13,
    color:       Colors.text.muted,
    lineHeight:  20,
  },
  triggerList: {
    marginTop: 10,
    gap:       6,
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  checkCircle: {
    width:         16,
    height:        16,
    borderRadius:  8,
    alignItems:    'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize:   9,
    fontWeight: '600',
  },
  triggerText: {
    fontSize: 12,
    color:    Colors.text.dim,
    flex:     1,
  },
  shimmer: {
    height:       12,
    borderRadius: 6,
    backgroundColor: Colors.bg.elevated,
  },
});