// app/track-record.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, RefreshCw, BarChart2 } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useTrackRecord } from '@/hooks/useTrackRecord';

export default function TrackRecordScreen() {
  const router = useRouter();
  const { data, loading, error, refetch } = useTrackRecord();

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color={COLORS.textPrimary.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Diagnostics</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={refetch} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.textPrimary.muted} />
          ) : (
            <RefreshCw size={14} color={COLORS.textPrimary.muted} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permanent Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            ℹ️ This reflects past signal performance only and does not predict future results. 
            Small sample sizes can be misleading.
          </Text>
        </View>

        {loading && !data ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.bullish} />
            <Text style={styles.loadingText}>Loading track record stats...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
              <Text style={styles.retryBtnText}>Retry Fetch</Text>
            </TouchableOpacity>
          </View>
        ) : data && !data.min_sample_size_met ? (
          /* Empty / Building State */
          <View style={styles.buildingCard}>
            <BarChart2 size={40} color="#64748B" style={styles.buildingIcon} />
            <Text style={styles.buildingTitle}>Collecting Diagnostics Data</Text>
            <Text style={styles.buildingText}>
              Still gathering data. Track record will appear once we have at least 20 evaluated signals.
            </Text>
            <View style={styles.buildingProgress}>
              <Text style={styles.progressLabel}>
                Evaluated: {data.total_evaluated} / 20 signals
              </Text>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${Math.min((data.total_evaluated / 20) * 100, 100)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        ) : data ? (
          /* Buckets Display State */
          <View style={styles.recordSection}>
            <Text style={styles.sectionLabel}>Historical Accuracy by Confidence</Text>
            
            {data.confidence_buckets.map((bucket) => {
              const showBullish = bucket.bullish_correct_pct !== null;
              const showBearish = bucket.bearish_correct_pct !== null;
              
              return (
                <View key={bucket.range} style={styles.bucketCard}>
                  <Text style={styles.bucketTitle}>Confidence Range: {bucket.range}%</Text>
                  
                  {/* Bullish Accuracy row */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricLabel}>Bullish Signals</Text>
                      <Text style={styles.metricValue}>
                        {showBullish 
                          ? `${bucket.bullish_correct_pct?.toFixed(1)}%` 
                          : '—'}{' '}
                        <Text style={styles.sampleSize}>(n={bucket.bullish_count})</Text>
                      </Text>
                    </View>
                    <View style={styles.accuracyBarBg}>
                      <View 
                        style={[
                          styles.accuracyBarFill, 
                          { width: (showBullish && bucket.bullish_correct_pct !== null ? `${bucket.bullish_correct_pct}%` : '0%') as any }
                        ]} 
                      />
                    </View>
                  </View>

                  {/* Bearish Accuracy row */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricLabel}>Bearish Signals</Text>
                      <Text style={styles.metricValue}>
                        {showBearish 
                          ? `${bucket.bearish_correct_pct?.toFixed(1)}%` 
                          : '—'}{' '}
                        <Text style={styles.sampleSize}>(n={bucket.bearish_count})</Text>
                      </Text>
                    </View>
                    <View style={styles.accuracyBarBg}>
                      <View 
                        style={[
                          styles.accuracyBarFill, 
                          { width: (showBearish && bucket.bearish_correct_pct !== null ? `${bucket.bearish_correct_pct}%` : '0%') as any }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              );
            })}
            
            <Text style={styles.metaText}>
              Total Signals Logged: {data.total_signals_logged} · Evaluated: {data.total_evaluated}
            </Text>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: COLORS.appBg.base,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        56,
    paddingBottom:     8,
  },
  iconBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: COLORS.appBg.card,
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerTitle: {
    fontSize:   14,
    fontFamily: 'Montserrat_600SemiBold',
    color:      COLORS.textPrimary.primary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop:        8,
    gap:               16,
  },
  
  // Disclaimer Card
  disclaimerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth:     1,
    borderColor:     'rgba(255, 255, 255, 0.06)',
    borderRadius:    14,
    padding:         14,
  },
  disclaimerText: {
    fontSize:   12,
    color:      COLORS.textPrimary.muted,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 18,
  },

  // Building state card
  buildingCard: {
    backgroundColor: COLORS.appBg.card,
    borderRadius:    20,
    padding:         24,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     COLORS.border.default,
  },
  buildingIcon: {
    marginBottom: 16,
  },
  buildingTitle: {
    fontSize:     16,
    fontFamily:   'Montserrat_700Bold',
    color:        COLORS.textPrimary.primary,
    marginBottom: 8,
  },
  buildingText: {
    fontSize:   13,
    fontFamily: 'Montserrat_400Regular',
    color:      COLORS.textPrimary.muted,
    textAlign:  'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  buildingProgress: {
    width: '100%',
    gap:   6,
  },
  progressLabel: {
    fontSize:   11,
    fontFamily: 'Montserrat_600SemiBold',
    color:      '#64748B',
  },
  progressBarBg: {
    height:          6,
    borderRadius:    3,
    backgroundColor: COLORS.appBg.elevated,
    overflow:        'hidden',
  },
  progressBarFill: {
    height:          '100%',
    backgroundColor: '#64748B', // Slate accent
  },

  // Dynamic values card list
  recordSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize:      10,
    fontFamily:    'Montserrat_700Bold',
    color:         COLORS.textPrimary.faint,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom:  4,
  },
  bucketCard: {
    backgroundColor: COLORS.appBg.card,
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     COLORS.border.default,
    gap:             14,
  },
  bucketTitle: {
    fontSize:   14,
    fontFamily: 'Montserrat_700Bold',
    color:      COLORS.textPrimary.primary,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border.default,
    paddingBottom: 8,
  },
  metricRow: {
    gap: 6,
  },
  metricHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
  },
  metricLabel: {
    fontSize:   13,
    fontFamily: 'Montserrat_500Medium',
    color:      COLORS.textPrimary.muted,
  },
  metricValue: {
    fontSize:   13,
    fontFamily: 'Montserrat_600SemiBold',
    color:      COLORS.textPrimary.primary,
  },
  sampleSize: {
    fontSize:   11,
    fontFamily: 'Montserrat_400Regular',
    color:      COLORS.textPrimary.faint,
  },
  accuracyBarBg: {
    height:          8,
    borderRadius:    4,
    backgroundColor: COLORS.appBg.elevated,
    overflow:        'hidden',
  },
  accuracyBarFill: {
    height:          '100%',
    backgroundColor: '#64748B', // Slate accent bar (no green/red)
  },
  metaText: {
    fontSize:   11,
    fontFamily: 'Montserrat_500Medium',
    color:      COLORS.textPrimary.faint,
    textAlign:  'center',
    marginTop:  8,
  },

  // Helpers
  centerContainer: {
    paddingVertical: 64,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             12,
  },
  loadingText: {
    fontSize:   13,
    fontFamily: 'Montserrat_500Medium',
    color:      COLORS.textPrimary.muted,
  },
  errorCard: {
    backgroundColor: COLORS.appBg.card,
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     COLORS.bearish + '40',
    alignItems:      'center',
    gap:             12,
  },
  errorText: {
    fontSize:   13,
    fontFamily: 'Montserrat_500Medium',
    color:      COLORS.bearish,
    textAlign:  'center',
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical:   8,
    backgroundColor:   COLORS.appBg.elevated,
    borderRadius:      8,
  },
  retryBtnText: {
    fontSize:   12,
    fontFamily: 'Montserrat_600SemiBold',
    color:      COLORS.textPrimary.primary,
  },
});
