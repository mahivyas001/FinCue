import React, { useState } from 'react';
import {
  View, Text, ScrollView, Switch,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { requestPushTokenPermission } from '@/hooks/usePushToken';

export default function SettingsScreen() {
  const {
    mode,
    setMode,
    quizzesEnabled,
    setQuizzesEnabled,
    pushToken,
    alertsEnabled,
    setPushToken,
    setAlertsEnabled
  } = useAppStore();
  const isAdvanced = mode === 'advanced';
  const router = useRouter();
  const [showPermissionDeniedMsg, setShowPermissionDeniedMsg] = useState(false);

  const handleAlertsToggle = async (val: boolean) => {
    if (val) {
      const success = await requestPushTokenPermission(setPushToken);
      if (success) {
        setAlertsEnabled(true);
        setShowPermissionDeniedMsg(false);
      } else {
        setAlertsEnabled(false);
        setShowPermissionDeniedMsg(true);
      }
    } else {
      setAlertsEnabled(false);
      setShowPermissionDeniedMsg(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Mode toggle */}
        <Text style={styles.sectionLabel}>Experience Mode</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Text style={styles.toggleTitle}>
                {isAdvanced ? 'Advanced Mode' : 'Beginner Mode'}
              </Text>
              <Text style={styles.toggleSub}>
                {isAdvanced
                  ? 'Technical indicators, raw values, candlestick charts'
                  : 'Plain English explanations, simple line charts'}
              </Text>
            </View>
            <Switch
              value={isAdvanced}
              onValueChange={(val) => setMode(val ? 'advanced' : 'beginner')}
              trackColor={{
                false: COLORS.appBg.elevated,
                true:  COLORS.bullishBg,
              }}
              thumbColor={isAdvanced ? COLORS.bullish : COLORS.textPrimary.faint}
              ios_backgroundColor={COLORS.appBg.elevated}
            />
          </View>
        </View>

        {/* Mode cards */}
        <View style={styles.modeGrid}>
          <TouchableOpacity
            style={[
              styles.modeCard,
              !isAdvanced && styles.modeCardActive,
              !isAdvanced && { borderColor: COLORS.bullish + '55' },
            ]}
            onPress={() => setMode('beginner')}
            activeOpacity={0.75}
          >
            <Text style={styles.modeEmoji}>🌱</Text>
            <Text style={[
              styles.modeName,
              !isAdvanced && { color: COLORS.bullish },
            ]}>
              Beginner
            </Text>
            <Text style={styles.modeDesc}>
              Plain English, simple charts, guided insights
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeCard,
              isAdvanced && styles.modeCardActive,
              isAdvanced && { borderColor: COLORS.bearish + '55' },
            ]}
            onPress={() => setMode('advanced')}
            activeOpacity={0.75}
          >
            <Text style={styles.modeEmoji}>📊</Text>
            <Text style={[
              styles.modeName,
              isAdvanced && { color: COLORS.bearish },
            ]}>
              Advanced
            </Text>
            <Text style={styles.modeDesc}>
              RSI, MACD, candlesticks, raw indicator values
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quiz switch */}
        <Text style={styles.sectionLabel}>Learning Tools</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Text style={styles.toggleTitle}>Reasoning Quizzes</Text>
              <Text style={styles.toggleSub}>
                Guess before the AI explains — builds your intuition
              </Text>
            </View>
            <Switch
              value={quizzesEnabled}
              onValueChange={setQuizzesEnabled}
              trackColor={{
                false: COLORS.appBg.elevated,
                true:  COLORS.bullishBg,
              }}
              thumbColor={quizzesEnabled ? COLORS.bullish : COLORS.textPrimary.faint}
              ios_backgroundColor={COLORS.appBg.elevated}
            />
          </View>
        </View>

        {/* Alerts Switch */}
        <Text style={styles.sectionLabel}>Alerts</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Text style={styles.toggleTitle}>Price Alerts</Text>
              <Text style={styles.toggleSub}>
                Get notified when a watchlisted stock's signal changes, RSI reaches extremes, or volume spikes.
              </Text>
            </View>
            <Switch
              value={alertsEnabled}
              onValueChange={handleAlertsToggle}
              trackColor={{
                false: COLORS.appBg.elevated,
                true:  COLORS.bullishBg,
              }}
              thumbColor={alertsEnabled ? COLORS.bullish : COLORS.textPrimary.faint}
              ios_backgroundColor={COLORS.appBg.elevated}
            />
          </View>
          {showPermissionDeniedMsg && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Notification permission was denied. Please enable notifications in your device system settings to receive alerts.
              </Text>
            </View>
          )}
        </View>

        {/* Transparency section */}
        <Text style={styles.sectionLabel}>System Transparency</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/track-record' as any)}
          activeOpacity={0.75}
        >
          <View style={styles.navRow}>
            <View style={styles.navLeft}>
              <Text style={styles.navTitle}>AI Track Record</Text>
              <Text style={styles.navSub}>
                View aggregate honesty and historical accuracy statistics
              </Text>
            </View>
            <Text style={styles.navArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* About section */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App</Text>
            <Text style={styles.aboutValue}>FinCue</Text>
          </View>
          <View style={[styles.aboutRow, styles.aboutRowBorder]}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0 (Beta)</Text>
          </View>
          <View style={[styles.aboutRow, styles.aboutRowBorder]}>
            <Text style={styles.aboutLabel}>Markets</Text>
            <Text style={styles.aboutValue}>US · India</Text>
          </View>
          <View style={[styles.aboutRow, styles.aboutRowBorder]}>
            <Text style={styles.aboutLabel}>Data</Text>
            <Text style={styles.aboutValue}>Alpha Vantage</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <Text style={styles.sectionLabel}>Disclaimer</Text>
        <View style={styles.card}>
          <Text style={styles.disclaimerText}>
            FinCue is an educational market analysis tool. It does not execute trades,
            manage portfolios, or guarantee any financial outcome. All signals and insights
            are for informational purposes only.{'\n\n'}
            Past market patterns are not a predictor of future results. Always do your
            own research before making any investment decision.
          </Text>
        </View>

        {/* Signal legend */}
        <Text style={styles.sectionLabel}>Signal Colors</Text>
        <View style={styles.card}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.bullish }]} />
            <View>
              <Text style={[styles.legendName, { color: COLORS.bullish }]}>Bullish</Text>
              <Text style={styles.legendDesc}>Positive momentum indicators</Text>
            </View>
          </View>
          <View style={[styles.legendRow, styles.legendRowBorder]}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.bearish }]} />
            <View>
              <Text style={[styles.legendName, { color: COLORS.bearish }]}>Bearish</Text>
              <Text style={styles.legendDesc}>Negative momentum indicators</Text>
            </View>
          </View>
          <View style={[styles.legendRow, styles.legendRowBorder]}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.neutral }]} />
            <View>
              <Text style={[styles.legendName, { color: COLORS.neutral }]}>Neutral</Text>
              <Text style={styles.legendDesc}>No strong directional signal</Text>
            </View>
          </View>
        </View>

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
    paddingHorizontal: 20,
    paddingTop:        60,
    paddingBottom:     16,
  },
  title: {
    fontSize:      24,
    fontWeight:    '700',
    color:         COLORS.textPrimary.primary,
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize:      10,
    color:         COLORS.textPrimary.faint,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    marginBottom:  8,
    marginTop:     20,
  },

  // Cards
  card: {
    backgroundColor: COLORS.appBg.card,
    borderRadius:    16,
    padding:         16,
  },

  // Toggle row
  toggleRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            12,
  },
  toggleLeft: {
    flex: 1,
    gap:  4,
  },
  toggleTitle: {
    fontSize:   14,
    fontWeight: '600',
    color:      COLORS.textPrimary.primary,
  },
  toggleSub: {
    fontSize:   12,
    color:      COLORS.textPrimary.faint,
    lineHeight: 18,
  },

  // Mode cards
  modeGrid: {
    flexDirection: 'row',
    gap:           10,
    marginTop:     10,
  },
  modeCard: {
    flex:            1,
    backgroundColor: COLORS.appBg.card,
    borderRadius:    14,
    padding:         14,
    gap:             5,
    borderWidth:     1,
    borderColor:     'transparent',
  },
  modeCardActive: {
    borderWidth: 1,
  },
  modeEmoji: {
    fontSize:    20,
    marginBottom: 2,
  },
  modeName: {
    fontSize:   14,
    fontWeight: '600',
    color:      COLORS.textPrimary.muted,  // ✅ Fixed: secondary doesn't exist
  },
  modeDesc: {
    fontSize:   11,
    color:      COLORS.textPrimary.faint,
    lineHeight: 16,
  },

  // About rows
  aboutRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: 8,
  },
  aboutRowBorder: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border.default,  // ✅ Fixed: was COLORS.border
  },
  aboutLabel: {
    fontSize: 13,
    color:    COLORS.textPrimary.muted,
  },
  aboutValue: {
    fontSize:   13,
    fontWeight: '500',
    color:      COLORS.textPrimary.muted,  // ✅ Fixed: secondary doesn't exist
  },

  // Disclaimer
  disclaimerText: {
    fontSize:   12,
    color:      COLORS.textPrimary.faint,
    lineHeight: 19,
  },

  // Signal legend
  legendRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    paddingVertical: 9,
  },
  legendRowBorder: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border.default,  // ✅ Fixed: was COLORS.border
  },
  legendDot: {
    width:        10,
    height:       10,
    borderRadius: 5,
  },
  legendName: {
    fontSize:   13,
    fontWeight: '600',
    marginBottom: 1,
  },
  legendDesc: {
    fontSize: 11,
    color:    COLORS.textPrimary.faint,
  },
  navRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            12,
  },
  navLeft: {
    flex: 1,
    gap:  4,
  },
  navTitle: {
    fontSize:   14,
    fontWeight: '600',
    color:      COLORS.textPrimary.primary,
  },
  navSub: {
    fontSize:   12,
    color:      COLORS.textPrimary.faint,
    lineHeight: 18,
  },
  navArrow: {
    fontSize:   18,
    color:      COLORS.textPrimary.faint,
    fontWeight: '600',
  },
  warningContainer: {
    marginTop:      10,
    paddingTop:     10,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border.default,
  },
  warningText: {
    fontSize:   12,
    color:      COLORS.bearish,
    lineHeight: 18,
  },
});