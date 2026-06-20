import React from 'react';
import { useExplanation } from '@/hooks/useExplanation';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Star, RefreshCw, AlertCircle } from 'lucide-react-native';
import { COLORS, SignalType, getSignalColor, signalColor, signalTint } from '@/constants/colors';
import { Signal } from '@/types/stock';
import SignalBadge from '@/components/ui/SignalBadge';
import AIInsightCard from '@/components/ui/AIInsightCard';
import IndicatorRow from '@/components/stock/IndicatorRow';
import ChartContainer from '@/components/charts/ChartContainer';
import { useAppStore } from '@/store/useAppStore';
import { useStockQuote } from '@/hooks/useStockQuote';
import { useBehaviorStore } from '@/store/useBehaviorStore';
import BehaviorInsightCard from '@/components/insights/BehaviorInsightCard';
import { useAnalysis } from '@/hooks/useAnalysis';
import { MOCK_STOCKS } from '@/constants/mockData';

export default function StockDetailScreen() {
  const params   = useLocalSearchParams();
  const symbol   = params.symbol as string;
  const router   = useRouter();

  const mode       = useAppStore(s => s.mode);
  const watchlist  = useAppStore(s => s.watchlist);
  const isAdvanced = mode === 'advanced';

  const stockMeta = MOCK_STOCKS.find((s) => s.symbol === symbol);

  const { stock, isLoading: quoteLoading, refresh: refreshQuote }             = useStockQuote(symbol ?? '');
  const { analysis, isLoading: analysisLoading, error: analysisError, refresh: refreshAnalysis } = useAnalysis(symbol ?? '');

  const explanationMode = isAdvanced ? 'advanced' : 'beginner';
  const { data: explanationData, loading: explanationLoading, error: explanationError } = useExplanation(symbol ?? '', explanationMode);

  const isSaved   = watchlist.includes(symbol ?? '');
  const isLoading = quoteLoading || analysisLoading;

  const price     = stock?.price         ?? stockMeta?.price         ?? 0;
  const change    = stock?.change        ?? stockMeta?.change        ?? 0;
  const changePct = stock?.changePercent ?? stockMeta?.changePercent ?? 0;
  const currency  = stockMeta?.market === 'IN' ? '₹' : '$';
  const isPos     = change >= 0;

  const signal: Signal = (analysis?.signal ?? 'neutral') as Signal;
  const confidence     = analysis?.confidence ?? 0;
  const sigColor       = signalColor(signal);
  const sigTint        = signalTint(signal);

  const recordView = useBehaviorStore(s => s.recordView);
  const activeInsights = useBehaviorStore(s => s.activeInsights);
  const dismissInsight = useBehaviorStore(s => s.dismissInsight);

  const symbolInsights = activeInsights.filter(
    ins => ins.symbol === symbol && ins.type !== 'confirmation_seeking'
  );

  const hasTrackedView = React.useRef(false);

  React.useEffect(() => {
    if (symbol && price > 0 && !hasTrackedView.current) {
      recordView(symbol, price);
      hasTrackedView.current = true;
    }
  }, [symbol, price, recordView]);

  const rsi        = analysis?.indicators?.rsi            ?? null;
  const macdSignal = analysis?.indicators?.macd_signal    ?? '—';
  const maVsLabel  = analysis?.indicators?.vs_moving_avg  ?? '—';
  const volLabel   = analysis?.indicators?.volume_level   ?? '—';
  const trendLabel = analysis?.indicators?.trend_strength ?? '—';

  const explanationText = explanationLoading
    ? 'Generating AI insight...'
    : explanationError
    ? isAdvanced
      ? `RSI at ${rsi?.toFixed(1) ?? '—'} · MACD ${macdSignal} · ${maVsLabel} MA50 · ${trendLabel} trend.`
      : signal === 'bullish'
      ? 'Buyers have been pushing this stock up steadily. Positive momentum detected.'
      : signal === 'bearish'
      ? 'Selling pressure has been building. Indicators suggest caution.'
      : 'No strong direction yet — the stock is in a wait-and-see zone.'
    : explanationData?.explanation ?? '';

  const handleToggleWatchlist = () => {
    const { addToWatchlist, removeFromWatchlist } = useAppStore.getState();
    if (!isSaved) {
      const capSignal = signal === 'bullish' ? 'Bullish' : signal === 'bearish' ? 'Bearish' : 'Neutral';
      useBehaviorStore.getState().recordWatchlistAdd(symbol ?? '', price, capSignal, changePct);
    }
    isSaved ? removeFromWatchlist(symbol ?? '') : addToWatchlist(symbol ?? '');
  };

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
          <ChevronLeft size={20} color={COLORS.textPrimary.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stockMeta?.name ?? symbol}</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleToggleWatchlist}>
          <Star
            size={18}
            color={isSaved ? COLORS.bullish : COLORS.textPrimary.faint}
            fill={isSaved ? COLORS.bullish : 'transparent'}
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
            tintColor={COLORS.bullish}
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
          <View style={[styles.changePill, { backgroundColor: sigTint }]}>
            {!quoteLoading && <View style={[styles.liveDot, { backgroundColor: sigColor }]} />}
            {quoteLoading ? (
              <ActivityIndicator size="small" color={sigColor} />
            ) : (
              <Text style={[styles.changePillText, { color: sigColor }]}>
                {isPos ? '+' : ''}{change.toFixed(2)} ({isPos ? '+' : ''}{changePct.toFixed(2)}%) Today
              </Text>
            )}
          </View>
        </View>

        {/* Signal + refresh */}
        <View style={styles.signalRow}>
          <SignalBadge signal={signal} confidence={confidence} size="md" />
          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} disabled={isLoading}>
            {isLoading
              ? <ActivityIndicator size="small" color={COLORS.textPrimary.muted} />
              : <RefreshCw size={14} color={COLORS.textPrimary.muted} />
            }
          </TouchableOpacity>
        </View>

        {/* Error banner */}
        {analysisError && (
          <View style={styles.errorBanner}>
            <AlertCircle size={14} color={COLORS.bearish} />
            <Text style={styles.errorText}>{analysisError} — showing cached data</Text>
          </View>
        )}

        {/* AI Insight — PRIMARY */}
        <View style={styles.section}>
          <AIInsightCard
            signal={signal}
            confidence={confidence}
            explanation={explanationText}
            isBeginnerMode={!isAdvanced}
            isLoading={analysisLoading || explanationLoading}
            symbol={symbol ?? undefined}
            rsi={rsi}
            macdSignal={macdSignal}
            maVsLabel={maVsLabel}
            volLabel={volLabel}
          />
        </View>

        {/* Behavioral Insights */}
        {symbolInsights.map(insight => (
          <View key={insight.id} style={styles.section}>
            <BehaviorInsightCard
              insight={insight}
              isBeginnerMode={!isAdvanced}
              onDismiss={() => dismissInsight(insight.id)}
            />
          </View>
        ))}

        {/* Chart */}
        <View style={styles.section}>
          <ChartContainer symbol={symbol ?? ''} signal={signal} />
        </View>

        {/* Technical indicators */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Technical Signals</Text>
          {analysisLoading ? (
            <View style={styles.shimmerGroup}>
              {[1, 2, 3, 4, 5].map((n) => <View key={n} style={styles.shimmer} />)}
            </View>
          ) : (
            <>
              <IndicatorRow label="RSI (14)"      value={rsi !== null ? rsi : '—'}  signal={rsi !== null ? (rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : 'neutral') : 'neutral'} />
              <IndicatorRow label="MACD"           value={macdSignal}                signal={macdSignal === 'Bullish' ? 'bullish' : macdSignal === 'Bearish' ? 'bearish' : 'neutral'} />
              <IndicatorRow label="vs MA 50"       value={maVsLabel}                 signal={maVsLabel === 'Above' ? 'bullish' : maVsLabel === 'Below' ? 'bearish' : 'neutral'} />
              <IndicatorRow label="Volume"         value={volLabel}                  signal={volLabel === 'High' ? 'bullish' : volLabel === 'Low' ? 'bearish' : 'neutral'} />
              <IndicatorRow label="Trend Strength" value={trendLabel}                signal={trendLabel === 'Strong' ? 'bullish' : trendLabel === 'Weak' ? 'bearish' : 'neutral'} divider={false} />
            </>
          )}
        </View>

        {/* Historical context */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Historical Context</Text>
          <Text style={styles.historicalText}>
            In similar past setups with RSI near this level, outcomes varied widely — some stocks
            continued higher, others reversed. Past patterns are not a predictor of future results.
          </Text>
          <View style={styles.disclaimerRow}>
            <AlertCircle size={11} color={COLORS.textPrimary.faint} />
            <Text style={styles.disclaimerText}>Historical context only — not a prediction</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: COLORS.appBg.base },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
  iconBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.appBg.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { fontSize: 13, fontFamily: 'Montserrat_500Medium', color: COLORS.textPrimary.muted },
  content:        { paddingHorizontal: 20, paddingTop: 8 },
  priceHero:      { alignItems: 'center', paddingTop: 16, paddingBottom: 12 },
  symbolLabel:    { fontSize: 11, fontFamily: 'Montserrat_600SemiBold', color: COLORS.textPrimary.faint, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  priceNumber:    { fontSize: 52, fontFamily: 'Montserrat_700Bold', color: COLORS.textPrimary.primary, letterSpacing: -2, lineHeight: 56 },
  changePill:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 100, marginTop: 10, minHeight: 32 },
  liveDot:        { width: 6, height: 6, borderRadius: 3 },
  changePillText: { fontSize: 13, fontFamily: 'Montserrat_600SemiBold' },
  signalRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  refreshBtn:     { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.appBg.card, alignItems: 'center', justifyContent: 'center' },
  errorBanner:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.bearishBg, borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: COLORS.bearishBorder },
  errorText:      { fontSize: 11, fontFamily: 'Montserrat_500Medium', color: COLORS.bearish, flex: 1 },
  section:        { marginBottom: 14 },
  card:           { backgroundColor: COLORS.appBg.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border.default },
  sectionLabel:   { fontSize: 10, fontFamily: 'Montserrat_700Bold', color: COLORS.textPrimary.faint, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  historicalText: { fontSize: 13, fontFamily: 'Montserrat_400Regular', color: COLORS.textPrimary.muted, lineHeight: 22, marginBottom: 10 },
  disclaimerRow:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  disclaimerText: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: COLORS.textPrimary.faint },
  shimmerGroup:   { gap: 12 },
  shimmer:        { height: 12, borderRadius: 6, backgroundColor: COLORS.appBg.elevated },
  notFound:       { flex: 1, backgroundColor: COLORS.appBg.base, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText:   { fontSize: 13, fontFamily: 'Montserrat_500Medium', color: COLORS.textPrimary.muted },
  backBtn:        { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.appBg.card, borderRadius: 10 },
  backBtnText:    { fontSize: 13, fontFamily: 'Montserrat_600SemiBold', color: COLORS.bullish },
});