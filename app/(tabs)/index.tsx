import React, { useState } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  ActivityIndicator, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Signal } from '@/types/stock';
import StockCard from '@/components/stock/StockCard';
import MarketFilterBar from '@/components/ui/MarketFilterBar';
import AIInsightCard from '@/components/ui/AIInsightCard';
import { useAppStore } from '@/store/useAppStore';
import { useMultipleQuotes } from '@/hooks/useStockQuote';
import { MOCK_STOCKS } from '@/constants/mockData';

type MarketFilter = 'All' | 'US' | 'India';

export default function HomeScreen() {
  const { mode } = useAppStore();
  const isAdvanced = mode === 'advanced';
  const [filter, setFilter] = useState<MarketFilter>('All');

  const symbols = MOCK_STOCKS.map((s) => s.symbol);
  const { quotes, loading, error, refresh } = useMultipleQuotes(symbols);

  // Keep signals lowercase — matches Signal type
  const normalizeSignal = (signal: string): Signal => {
    const lower = signal.toLowerCase();
    if (lower === 'bullish') return 'bullish';
    if (lower === 'bearish') return 'bearish';
    return 'neutral';
  };

  const filtered = MOCK_STOCKS.filter((s) => {
    if (filter === 'US')    return s.market === 'US';
    if (filter === 'India') return s.market === 'IN';
    return true;
  });

  const merged = filtered.map((s) => {
    const live          = quotes[s.symbol];
    const currentChange = live?.change ?? s.change;
    const currentPrice  = live?.price  ?? s.price;
    const changePercent = currentPrice ? (currentChange / currentPrice) * 100 : 0;
    return {
      ...s,
      signal:        normalizeSignal(s.signal),
      price:         currentPrice,
      change:        currentChange,
      changePercent,               // ← was changePct
    };
  });

  const featuredStock = merged.find((s) => s.signal === 'bullish') ?? merged[0];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.appName}>FinCue</Text>
        </View>
        <View style={[
          styles.modeBadge,
          { backgroundColor: isAdvanced ? Colors.bearish.tint : Colors.bullish.tint },
        ]}>
          <Text style={[
            styles.modeText,
            { color: isAdvanced ? Colors.bearish.primary : Colors.bullish.primary },
          ]}>
            {isAdvanced ? 'Advanced' : 'Beginner'}
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
            tintColor={Colors.bullish.primary}
          />
        }
      >
        {/* Error banner */}
        {error && (
          <TouchableOpacity style={styles.errorBanner} onPress={refresh}>
            <Text style={styles.errorText}>{error} · Tap to retry</Text>
          </TouchableOpacity>
        )}

        {/* Featured AI insight */}
        {featuredStock && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AI Radar</Text>
            <AIInsightCard
              signal={featuredStock.signal}
              confidence={featuredStock.confidence ?? 60}
              explanation={
                isAdvanced
                  ? `${featuredStock.symbol} is showing a ${featuredStock.signal} setup. Technical indicators align with the current price action.`
                  : `${featuredStock.name} looks interesting right now. The market data suggests ${
                      featuredStock.signal === 'bullish'
                        ? 'positive momentum'
                        : featuredStock.signal === 'bearish'
                        ? 'some selling pressure'
                        : 'no strong direction yet'
                    }.`
              }
              triggers={[
                `Signal: ${featuredStock.signal}`,
                `Confidence: ${featuredStock.confidence ?? 60}%`,
              ]}
              isBeginnerMode={!isAdvanced}
            />
          </View>
        )}

        {/* Market count (advanced only) */}
        {isAdvanced && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{merged.length}</Text>
              <Text style={styles.statLabel}>Tracking</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.bullish.primary }]}>
                {merged.filter((s) => s.signal === 'bullish').length}
              </Text>
              <Text style={styles.statLabel}>Bullish</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.bearish.primary }]}>
                {merged.filter((s) => s.signal === 'bearish').length}
              </Text>
              <Text style={styles.statLabel}>Bearish</Text>
            </View>
          </View>
        )}

        {/* Beginner tip */}
        {!isAdvanced && (
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              💡 Tap any stock below to see a plain-English breakdown of what the market is doing.
            </Text>
          </View>
        )}

        {/* Filter bar */}
        <MarketFilterBar active={filter} onChange={setFilter} />

        {/* Stock list */}
        <View style={styles.stockList}>
          {loading && merged.length === 0 ? (
            <ActivityIndicator color={Colors.bullish.primary} style={{ marginTop: 32 }} />
          ) : (
            merged.map((s) => (
              <StockCard
                key={s.symbol}
                symbol={s.symbol}
                name={s.name}
                price={s.price}
                change={s.change}
                changePercent={s.changePercent}   // ← was changePct
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
  screen:       { flex: 1, backgroundColor: Colors.bg.base },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  greeting:     { fontSize: 12, color: Colors.text.faint, marginBottom: 2 },
  appName:      { fontSize: 24, fontWeight: '700', color: Colors.text.primary, letterSpacing: -0.5 },
  modeBadge:    { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100 },
  modeText:     { fontSize: 12, fontWeight: '500' },
  content:      { paddingTop: 4 },
  section:      { paddingHorizontal: 20, marginBottom: 14 },
  sectionLabel: { fontSize: 10, color: Colors.text.faint, letterSpacing: 0.1, textTransform: 'uppercase', marginBottom: 8 },
  statsRow:     { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 14 },
  statCard:     { flex: 1, backgroundColor: Colors.bg.card, borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue:    { fontSize: 20, fontWeight: '600', color: Colors.text.primary },
  statLabel:    { fontSize: 11, color: Colors.text.faint, marginTop: 2 },
  tipCard:      { marginHorizontal: 20, marginBottom: 14, backgroundColor: Colors.bullish.tint, borderRadius: 12, padding: 12 },
  tipText:      { fontSize: 12, color: Colors.bullish.primary, lineHeight: 18 },
  stockList:    { paddingHorizontal: 20, paddingTop: 12 },
  errorBanner:  { marginHorizontal: 20, marginBottom: 12, backgroundColor: Colors.bearish.tint, borderRadius: 10, padding: 10 },
  errorText:    { fontSize: 12, color: Colors.bearish.primary, textAlign: 'center' },
});