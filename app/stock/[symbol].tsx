import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Star, RefreshCw, AlertCircle } from 'lucide-react-native';
import { Colors, signalColor, signalTint } from '@/constants/colors';
import { Signal } from '@/types/stock';
import SignalBadge from '@/components/ui/SignalBadge';
import AIInsightCard from '@/components/ui/AIInsightCard';
import IndicatorRow from '@/components/stock/IndicatorRow';
import ChartContainer from '@/components/charts/ChartContainer';
import { useAppStore } from '@/store/useAppStore';
import { useStockQuote } from '@/hooks/useStockQuote';
import { useAnalysis } from '@/hooks/useAnalysis';
import { MOCK_STOCKS } from '@/constants/mockData';

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router     = useRouter();
  const { mode, watchlist } = useAppStore();
  const toggleWatchlist = (useAppStore as any)(
    (state: any) => state.toggleWatchlist ?? (() => {})
  );
  const isAdvanced = mode === 'advanced';

  const stockMeta = MOCK_STOCKS.find((s) => s.symbol === symbol);

  const {
    stock,
    isLoading: quoteLoading,
    refresh:   refreshQuote,
  } = useStockQuote(symbol ?? '');

  const {
    analysis,
    isLoading:  analysisLoading,
    error:      analysisError,
    refresh:    refreshAnalysis,
  } = useAnalysis(symbol ?? '');

  const isSaved   = watchlist.some((item) => item.symbol === (symbol ?? ''));
  const isLoading = quoteLoading || analysisLoading;

  const price     = stock?.price         ?? stockMeta?.price         ?? 0;
  const change    = stock?.change        ?? stockMeta?.change        ?? 0;
  const changePct = stock?.changePercent ?? stockMeta?.changePercent ?? 0;
  const currency  = (stockMeta?.market === 'IN') ? '₹' : '$';
  const isPos     = change >= 0;

  // Signal is already lowercase from useAnalysis (normalizeSignal in hook)
  const signal: Signal     = (analysis?.signal ?? 'neutral') as Signal;
  const confidence         = analysis?.confidence ?? 0;

  // Indicators nested under analysis.indicators
  const rsi        = analysis?.indicators?.rsi            ?? null;
  const macdSignal = analysis?.indicators?.macd_signal    ?? '—';
  const maVsLabel  = analysis?.indicators?.vs_moving_avg  ?? '—';
  const volLabel   = analysis?.indicators?.volume_level   ?? '—';
  const trendLabel = analysis?.indicators?.trend_strength ?? '—';

  const beginnerTriggers = [
    'Price momentum is building',
    `Currently ${maVsLabel.toLowerCase()} 50-day average`,
    `Volume is ${volLabel.toLowerCase()}`,
  ];
  const advancedTriggers = [
    `RSI ${rsi?.toFixed(1) ?? '—'} — ${(rsi ?? 50) > 70 ? 'approaching overbought' : (rsi ?? 50) < 30 ? 'oversold territory' : 'mid-range'}`,
    `MACD: ${macdSignal}`,
    `MA50: ${maVsLabel} · Trend: ${trendLabel}`,
  ];

  const beginnerExplanation =
    signal === 'bullish'
      ? "Buyers have been pushing this stock up steadily. The numbers suggest positive momentum, though it's worth watching if it starts to slow down."
      : signal === 'bearish'
      ? "Selling pressure has been building. The stock has been losing ground recently and the indicators suggest caution for now."
      : "The stock isn't showing a strong direction yet — it's in a wait-and-see zone. No major signals at the moment.";

  const advancedExplanation =
    signal === 'bullish'
      ? `RSI at ${rsi?.toFixed(1) ?? '—'} indicates elevated momentum. MACD is ${macdSignal.toLowerCase()} and price is ${maVsLabel.toLowerCase()} the 50-day MA. ADX confirms ${trendLabel.toLowerCase()} trend strength.`
      : signal === 'bearish'
      ? `RSI at ${rsi?.toFixed(1) ?? '—'} showing weakening momentum. MACD is ${macdSignal.toLowerCase()} with price ${maVsLabel.toLowerCase()} MA50. Watch for further distribution.`
      : `Indicators are mixed. RSI at ${rsi?.toFixed(1) ?? '—'} — no directional conviction. Volume is ${volLabel.toLowerCase()} with ${trendLabel.toLowerCase()} trend strength.`;

  const handleRefresh = () => {
    refreshQuote();
    refreshAnalysis();
  };

  if (!stockMeta && !quoteLoading) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Stock not found: {symbol}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stockMeta?.name ?? symbol}</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => toggleWatchlist(symbol ?? '')}
        >
          <Star
            size={18}
            color={isSaved ? Colors.bullish.primary : Colors.text.faint}
            fill={isSaved ? Colors.bullish.primary : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.bullish.primary}
          />
        }
      >
        {/* Price hero */}
        <View style={styles.priceHero}>
          <Text style={styles.symbolLabel}>
            {symbol} · {stockMeta?.market === 'IN' ? 'NSE' : 'NASDAQ'}
          </Text>
          <Text style={styles.priceNumber}>
            {currency}{price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <View style={[styles.changePill, { backgroundColor: signalTint(signal) }]}>
            {!quoteLoading && <View style={styles.liveDot} />}
            {quoteLoading ? (
              <ActivityIndicator size="small" color={signalColor(signal)} />
            ) : (
              <Text style={[styles.changePillText, { color: signalColor(signal) }]}>
                {isPos ? '+' : ''}{change.toFixed(2)} ({isPos ? '+' : ''}{changePct.toFixed(2)}%) Today
              </Text>
            )}
          </View>
        </View>

        {/* Signal + refresh row */}
        <View style={styles.signalRow}>
          <SignalBadge signal={signal} confidence={confidence} size="md" />
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={handleRefresh}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator size="small" color={Colors.text.faint} />
              : <RefreshCw size={14} color={Colors.text.faint} />
            }
          </TouchableOpacity>
        </View>

        {/* Analysis error banner */}
        {analysisError && (
          <View style={styles.errorBanner}>
            <AlertCircle size={14} color={Colors.bearish.primary} />
            <Text style={styles.errorText}>
              {analysisError} — showing cached data
            </Text>
          </View>
        )}

        {/* Chart */}
        <View style={styles.section}>
          <ChartContainer symbol={symbol ?? ''} signal={signal} />
        </View>

        {/* Technical indicators */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Technical Signals</Text>
          {analysisLoading ? (
            <View style={styles.shimmerGroup}>
              {[1, 2, 3, 4, 5].map((n) => (
                <View key={n} style={styles.shimmer} />
              ))}
            </View>
          ) : (
            <>
  <IndicatorRow
    label="RSI (14)"
    value={rsi !== null ? rsi : '—'}
    barPct={rsi !== null ? Math.min(100, Math.max(0, rsi)) : 50}
  />
  <IndicatorRow
    label="MACD"
    value={macdSignal}
    barPct={macdSignal === 'Bullish' ? 65 : macdSignal === 'Bearish' ? 35 : 50}
  />
  <IndicatorRow
    label="vs MA 50"
    value={maVsLabel}
    barPct={maVsLabel === 'Above' ? 70 : maVsLabel === 'Below' ? 30 : 50}
  />
  <IndicatorRow
    label="Volume"
    value={volLabel}
    barPct={volLabel === 'High' ? 80 : volLabel === 'Normal' ? 50 : 25}
  />
  <IndicatorRow
    label="Trend Strength"
    value={trendLabel}
    barPct={trendLabel === 'Strong' ? 85 : trendLabel === 'Moderate' ? 52 : 25}
    isLast
  />
</>
          )}
        </View>

        {/* AI Insight */}
        <View style={styles.section}>
          <AIInsightCard
            signal={signal}
            confidence={confidence}
            explanation={isAdvanced ? advancedExplanation : beginnerExplanation}
            triggers={isAdvanced ? advancedTriggers : beginnerTriggers}
            isBeginnerMode={!isAdvanced}
            isLoading={analysisLoading}
          />
        </View>

        {/* Historical context */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Historical Context</Text>
          <Text style={styles.historicalText}>
            In similar past setups with RSI near this level, outcomes varied widely — some stocks
            continued higher, others reversed. Past patterns are not a predictor of future results.
          </Text>
          <View style={styles.disclaimerRow}>
            <AlertCircle size={11} color={Colors.text.faint} />
            <Text style={styles.disclaimerText}>
              Historical context only — not a prediction
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: Colors.bg.base },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
  iconBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bg.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { fontSize: 14, color: Colors.text.muted, letterSpacing: 0.05 },
  content:         { paddingHorizontal: 20, paddingTop: 8 },
  priceHero:       { alignItems: 'center', paddingTop: 16, paddingBottom: 12 },
  symbolLabel:     { fontSize: 12, color: Colors.text.faint, letterSpacing: 0.1, textTransform: 'uppercase', marginBottom: 6 },
  priceNumber:     { fontSize: 52, fontWeight: '600', color: Colors.text.primary, letterSpacing: -2, lineHeight: 56 },
  changePill:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 14, borderRadius: 100, marginTop: 10, minHeight: 30 },
  liveDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.bullish.primary },
  changePillText:  { fontSize: 13, fontWeight: '500' },
  signalRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  refreshBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bg.card, alignItems: 'center', justifyContent: 'center' },
  errorBanner:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bearish.tint, borderRadius: 10, padding: 10, marginBottom: 12 },
  errorText:       { fontSize: 12, color: Colors.bearish.primary, flex: 1 },
  section:         { marginBottom: 14 },
  card:            { backgroundColor: Colors.bg.card, borderRadius: 16, padding: 16, marginBottom: 14 },
  sectionLabel:    { fontSize: 10, color: Colors.text.faint, letterSpacing: 0.1, textTransform: 'uppercase', marginBottom: 12 },
  historicalText:  { fontSize: 13, color: Colors.text.muted, lineHeight: 20, marginBottom: 10 },
  disclaimerRow:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  disclaimerText:  { fontSize: 11, color: Colors.text.faint },
  shimmerGroup:    { gap: 12 },
  shimmer:         { height: 12, borderRadius: 6, backgroundColor: Colors.bg.elevated },
  notFound:        { flex: 1, backgroundColor: Colors.bg.base, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText:    { fontSize: 14, color: Colors.text.muted },
  backBtn:         { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.bg.card, borderRadius: 10 },
  backBtnText:     { fontSize: 13, color: Colors.bullish.primary },
});