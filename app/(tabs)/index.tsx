import React, { useState } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  ActivityIndicator, StyleSheet, TouchableOpacity,
} from 'react-native';
import { COLORS, SignalType, normalizeSignal } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/fonts';
import StockCard from '@/components/stock/StockCard';
import MarketFilterBar from '@/components/ui/MarketFilterBar';
import AIInsightCard from '@/components/ui/AIInsightCard';
import { useAppStore } from '@/store/useAppStore';
import { useMultipleQuotes } from '@/hooks/useStockQuote';
import { MOCK_STOCKS } from '@/constants/mockData';

type MarketFilter = 'All' | 'US' | 'India';

export default function HomeScreen() {
  const mode = useAppStore(s => s.mode);
  const isAdvanced = mode === 'advanced';
  const [filter, setFilter] = useState<MarketFilter>('All');

  const symbols = MOCK_STOCKS.map((s) => s.symbol);
  const { quotes, loading, error, refresh } = useMultipleQuotes(symbols);

  const filtered = MOCK_STOCKS.filter((s) => {
    if (filter === 'US')    return s.market === 'US';
    if (filter === 'India') return s.market === 'IN';
    return true;
  });

  const merged = filtered.map((s) => {
    const live          = quotes[s.symbol];
    const currentPrice  = live?.price  ?? s.price;
    const currentChange = live?.change ?? s.change;
    const changePercent = currentPrice ? (currentChange / currentPrice) * 100 : 0;
    return {
      ...s,
      signal:        normalizeSignal(s.signal) as SignalType,
      price:         currentPrice,
      change:        currentChange,
      changePercent,
    };
  });

  const featuredStock = merged.find((s) => s.signal === 'bullish') ?? merged[0];

  const bullishCount = merged.filter((s) => s.signal === 'bullish').length;
  const bearishCount = merged.filter((s) => s.signal === 'bearish').length;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.appName}>
            Fin<Text style={{ color: COLORS.bullish }}>Cue</Text>
          </Text>
        </View>
        <View style={[
          styles.modeBadge,
          { backgroundColor: isAdvanced ? COLORS.bearishBg : COLORS.bullishBg,
            borderColor: isAdvanced ? COLORS.bearishBorder : COLORS.bullishBorder },
        ]}>
          <Text style={[
            styles.modeText,
            { color: isAdvanced ? COLORS.bearish : COLORS.bullish },
          ]}>
            {isAdvanced ? '⚡ Advanced' : '🌱 Beginner'}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={COLORS.bullish}
          />
        }
      >
        {/* Error banner */}
        {error && (
          <TouchableOpacity style={styles.errorBanner} onPress={refresh}>
            <Text style={styles.errorText}>{error} · Tap to retry</Text>
          </TouchableOpacity>
        )}

        {/* ── AI Radar — PRIMARY SECTION ── */}
        {featuredStock && (
          <View style={styles.radarSection}>
            <View style={styles.radarHeader}>
              <Text style={styles.radarLabel}>AI RADAR</Text>
              <View style={styles.radarLivePill}>
                <View style={styles.liveDot} />
                <Text style={styles.radarLiveText}>LIVE</Text>
              </View>
            </View>

            {/* Big explanation card — this is the hero */}
            <View style={[styles.radarCard, {
              borderColor: featuredStock.signal === 'bullish'
                ? COLORS.bullishBorder
                : featuredStock.signal === 'bearish'
                ? COLORS.bearishBorder
                : COLORS.neutralBorder,
            }]}>
              <Text style={styles.radarStockSymbol}>{featuredStock.symbol}</Text>
              <Text style={styles.radarStockName}>{featuredStock.name}</Text>

              <Text style={styles.radarExplanation}>
                {isAdvanced
                  ? `${featuredStock.symbol} is showing a ${featuredStock.signal} setup with ${featuredStock.confidence ?? 60}% confidence. Technical indicators align with current price action — monitor for continuation.`
                  : featuredStock.signal === 'bullish'
                  ? `${featuredStock.name} is showing encouraging signs. Buyers have been steadily pushing the price up, and the momentum looks healthy. Worth keeping an eye on.`
                  : featuredStock.signal === 'bearish'
                  ? `${featuredStock.name} is facing some selling pressure lately. The data suggests caution — the price has been struggling to hold its ground.`
                  : `${featuredStock.name} isn't showing a clear direction yet. The market is in a wait-and-see mode for this one.`
                }
              </Text>

              <View style={styles.radarFooter}>
                <View style={[styles.radarSignalPill, {
                  backgroundColor: featuredStock.signal === 'bullish' ? COLORS.bullishBg : featuredStock.signal === 'bearish' ? COLORS.bearishBg : COLORS.neutralBg,
                  borderColor: featuredStock.signal === 'bullish' ? COLORS.bullishBorder : featuredStock.signal === 'bearish' ? COLORS.bearishBorder : COLORS.neutralBorder,
                }]}>
                  <View style={[styles.radarSignalDot, {
                    backgroundColor: featuredStock.signal === 'bullish' ? COLORS.bullish : featuredStock.signal === 'bearish' ? COLORS.bearish : COLORS.neutral,
                  }]} />
                  <Text style={[styles.radarSignalText, {
                    color: featuredStock.signal === 'bullish' ? COLORS.bullish : featuredStock.signal === 'bearish' ? COLORS.bearish : COLORS.neutral,
                  }]}>
                    {featuredStock.signal.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.radarConfidence}>
                  {featuredStock.confidence ?? 60}% confident
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Market stats (advanced) */}
        {isAdvanced && (
          <View style={styles.statsRow}>
            {[
              { label: 'Tracking', value: merged.length, color: COLORS.textPrimary },
              { label: 'Bullish',  value: bullishCount,  color: COLORS.bullish },
              { label: 'Bearish',  value: bearishCount,  color: COLORS.bearish },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Beginner tip */}
        {!isAdvanced && (
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              💡 Tap any stock below to read the full AI explanation of what the market is doing.
            </Text>
          </View>
        )}

        {/* Filter bar */}
        <MarketFilterBar active={filter} onChange={setFilter} />

        {/* Stock list */}
        <View style={styles.stockList}>
          {loading && merged.length === 0 ? (
            <ActivityIndicator color={COLORS.bullish} style={{ marginTop: 32 }} />
          ) : (
            merged.map((s) => (
              <StockCard
                key={s.symbol}
                symbol={s.symbol}
                name={s.name}
                price={s.price}
                change={s.change}
                changePercent={s.changePercent}
                signal={s.signal}
                confidence={s.confidence}
                market={s.market}
              />
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: COLORS.bg },
  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  greeting: { fontSize: FONT_SIZE.xs, color: COLORS.textFaint, fontFamily: FONTS.regular, marginBottom: 2 },
  appName:  { fontSize: FONT_SIZE.xl, fontFamily: FONTS.bold, color: COLORS.textPrimary, letterSpacing: -0.5 },
  modeBadge:{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, borderWidth: 1 },
  modeText: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.semiBold },

  content:  { paddingTop: 4 },

  // ── AI Radar ──
  radarSection:     { paddingHorizontal: 20, marginBottom: 20 },
  radarHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  radarLabel:       { fontSize: FONT_SIZE.xs, fontFamily: FONTS.bold, color: COLORS.textFaint, letterSpacing: 1.5 },
  radarLivePill:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.bullishBg, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.bullishBorder },
  liveDot:          { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.bullish },
  radarLiveText:    { fontSize: 9, fontFamily: FONTS.bold, color: COLORS.bullish, letterSpacing: 1 },
  radarCard:        { backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 20, borderWidth: 1 },
  radarStockSymbol: { fontSize: FONT_SIZE.xl, fontFamily: FONTS.extraBold, color: COLORS.textPrimary, letterSpacing: 0.5, marginBottom: 2 },
  radarStockName:   { fontSize: FONT_SIZE.sm, fontFamily: FONTS.regular, color: COLORS.textSub, marginBottom: 14 },
  radarExplanation: { fontSize: FONT_SIZE.base, fontFamily: FONTS.medium, color: COLORS.textPrimary, lineHeight: 24, marginBottom: 16 },
  radarFooter:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  radarSignalPill:  { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  radarSignalDot:   { width: 6, height: 6, borderRadius: 3 },
  radarSignalText:  { fontSize: FONT_SIZE.xs, fontFamily: FONTS.bold, letterSpacing: 1 },
  radarConfidence:  { fontSize: FONT_SIZE.xs, fontFamily: FONTS.regular, color: COLORS.textSub },

  // ── Stats ──
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statValue:{ fontSize: FONT_SIZE.lg, fontFamily: FONTS.bold, color: COLORS.textPrimary },
  statLabel:{ fontSize: FONT_SIZE.xs, fontFamily: FONTS.regular, color: COLORS.textFaint, marginTop: 2 },

  // ── Tip ──
  tipCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: COLORS.bullishBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.bullishBorder },
  tipText:  { fontSize: FONT_SIZE.sm, fontFamily: FONTS.medium, color: COLORS.bullish, lineHeight: 20 },

  // ── List ──
  stockList:   { paddingHorizontal: 20, paddingTop: 12 },
  errorBanner: { marginHorizontal: 20, marginBottom: 12, backgroundColor: COLORS.bearishBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.bearishBorder },
  errorText:   { fontSize: FONT_SIZE.xs, fontFamily: FONTS.medium, color: COLORS.bearish, textAlign: 'center' },
});