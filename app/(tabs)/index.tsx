// app/(tabs)/index.tsx
// HomeScreen — rewritten with new flat COLORS system
// Uses: COLORS.appBg, COLORS.bullish, getSignalColor(), normalizeSignal()
// No more nested COLORS.bullish.primary / COLORS.bg / COLORS.text

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import StockCard from '@/components/stock/StockCard';
import AIInsightCard from '@/components/ui/AIInsightCard';
import MarketFilterBar from '@/components/ui/MarketFilterBar';
import { useMultipleQuotes } from '@/hooks/useStockQuote';
import { COLORS, SignalType, normalizeSignal, getSignalColor } from '@/constants/colors';
import { useBehaviorStore } from '@/store/useBehaviorStore';
import BehaviorInsightCard from '@/components/insights/BehaviorInsightCard';
import { FONTS, FONT_SIZE } from '@/constants/fonts';
import { MOCK_STOCKS } from '@/constants/mockData';
import { Stock } from '@/types/stock';
import { fetchRecentAlerts } from '@/lib/api/alerts';
const mockStocks = MOCK_STOCKS;

type MarketFilter = 'All' | 'US' | 'IN';

export default function HomeScreen() {
  const { mode } = useAppStore();
  const [filter, setFilter] = useState<MarketFilter>('All');
  const router = useRouter();
  const pushToken = useAppStore((s) => s.pushToken);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);

  useEffect(() => {
    if (!pushToken) return;
    const token = pushToken;
    let active = true;

    async function checkAlerts() {
      try {
        const list = await fetchRecentAlerts(token);
        if (active) {
          setHasUnreadAlerts(list.length > 0);
        }
      } catch (err) {
        console.error('[Home] Failed to check alerts:', err);
      }
    }

    checkAlerts();
    const interval = setInterval(checkAlerts, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pushToken]);

  const activeInsights = useBehaviorStore((s) => s.activeInsights);
  const dismissInsight = useBehaviorStore((s) => s.dismissInsight);

  // Get the most recent active behavior insight
  const sortedBehaviorInsights = [...activeInsights].sort(
    (a, b) => b.detectedAt - a.detectedAt
  );
  const latestBehaviorInsight = sortedBehaviorInsights[0] || null;

  const symbols = mockStocks.map((s: Stock) => s.symbol);
  const { quotes, loading, error, refresh } = useMultipleQuotes(symbols);

  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  // Merge live quotes into mock data
  const stocks = mockStocks.map((stock: Stock) => {
    const live = quotes[stock.symbol];
    return {
      ...stock,
      signal: normalizeSignal(stock.signal) as SignalType,
      price:         live?.price         ?? stock.price,
      change:        live?.change        ?? stock.change,
      changePercent: live?.changePercent ?? stock.changePercent,
    };
  });

  const filtered = filter === 'All'
    ? stocks
    : stocks.filter((s: any) => s.market === filter);

  // Featured insight — first bullish stock
  const featured = stocks.find((s: any) => s.signal === 'Bullish') ?? stocks[0];
  const featuredColor = getSignalColor(featured?.signal ?? 'Neutral');

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.textMuted}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.title}>
              Fin<Text style={styles.titleAccent}>Cue</Text>
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => router.push('/alerts' as any)}
              activeOpacity={0.75}
            >
              <Bell size={18} color={COLORS.textPrimary.primary} />
              {hasUnreadAlerts && <View style={styles.badgeDot} />}
            </TouchableOpacity>
            <View style={[
              styles.modePill,
              mode === 'advanced' && styles.modePillAdvanced,
            ]}>
              <Text style={styles.modeText}>
                {mode === 'beginner' ? '🌱 Beginner' : '⚡ Advanced'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Error banner ── */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              Live prices unavailable — showing cached data
            </Text>
            <TouchableOpacity onPress={refresh}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Beginner tip ── */}
        {mode === 'beginner' && (
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>💡 TIP</Text>
            <Text style={styles.tipText}>
              Tap any stock to see a full AI-powered analysis in plain English.
            </Text>
          </View>
        )}

        {/* ── Featured AI insight ── */}
        {featured && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AI RADAR</Text>
            <AIInsightCard
              signal={featured.signal as any}
              explanation={
                mode === 'beginner'
                  ? `${featured.name} is currently showing ${featured.signal.toLowerCase()} signals. Tap to see the full breakdown.`
                  : `${featured.symbol} — ${featured.signal} signal detected. Open for RSI, MACD and ADX detail.`
              }
              confidence={featured.confidence}
              isBeginnerMode={mode === 'beginner'}
            />
          </View>
        )}

        {/* ── Behavior Insight ── */}
        {latestBehaviorInsight && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>BEHAVIOR INSIGHT</Text>
            <BehaviorInsightCard
              insight={latestBehaviorInsight}
              isBeginnerMode={mode === 'beginner'}
              onDismiss={() => dismissInsight(latestBehaviorInsight.id)}
            />
          </View>
        )}

        {/* ── Market filter + stock list ── */}
        <View style={styles.section}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionLabel}>MARKETS</Text>
            {loading && !refreshing && (
              <ActivityIndicator size="small" color={COLORS.textMuted} />
            )}
            {mode === 'advanced' && (
              <Text style={styles.stockCount}>{filtered.length} stocks</Text>
            )}
          </View>

          <MarketFilterBar active={filter} onChange={setFilter} />

          <View style={styles.stockList}>
            {filtered.map((stock: any) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                livePrice={quotes[stock.symbol]?.price}
                liveChange={quotes[stock.symbol]?.change}
                liveChangePercent={quotes[stock.symbol]?.changePercent}
              />
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: COLORS.appBg.base,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop:        60,
    paddingBottom:     40,
    gap:               24,
  },

  // ── Header ──────────────────────────────────────
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  greeting: {
    fontFamily: FONTS.regular,
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textMuted,
    marginBottom: 2,
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize:   FONT_SIZE['2xl'],
    color:      COLORS.textPrimary.primary,
  },
  titleAccent: {
    color:   COLORS.textPrimary.primary,
    opacity: 0.4,
  },
  headerRight: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            10,
  },
  bellBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: COLORS.appBg.card,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     COLORS.border.default,
    position:        'relative',
  },
  badgeDot: {
    position:        'absolute',
    top:             8,
    right:           8,
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: COLORS.bearish,
  },
  modePill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.1)',
    borderRadius:    100,
    paddingHorizontal: 12,
    paddingVertical:  6,
  },
  modePillAdvanced: {
    backgroundColor: 'rgba(162,224,252,0.08)',
    borderColor:     'rgba(162,224,252,0.2)',
  },
  modeText: {
    fontFamily: FONTS.semiBold,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textSub,
  },

  // ── Error banner ────────────────────────────────
  errorBanner: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    backgroundColor: 'rgba(251,113,133,0.08)',
    borderWidth:    1,
    borderColor:    'rgba(251,113,133,0.2)',
    borderRadius:   12,
    padding:        12,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.bearish,
    flex:       1,
  },
  retryText: {
    fontFamily: FONTS.bold,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.bearish,
    marginLeft: 8,
  },

  // ── Tip card ────────────────────────────────────
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.07)',
    borderRadius:    14,
    padding:         14,
    gap:             4,
  },
  tipLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONT_SIZE.xs,
    color:         COLORS.textMuted,
    letterSpacing: 1.5,
  },
  tipText: {
    fontFamily: FONTS.regular,
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textSub,
    lineHeight: 20,
  },

  // ── Section ─────────────────────────────────────
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONT_SIZE.xs,
    color:         COLORS.textMuted,
    letterSpacing: 2,
  },
  listHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  stockCount: {
    fontFamily: FONTS.medium,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textMuted,
  },
  stockList: {
    gap: 2,
  },
});