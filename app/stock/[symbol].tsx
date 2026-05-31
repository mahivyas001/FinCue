import React from 'react';
import { useExplanation } from '@/hooks/useExplanation';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Star, RefreshCw, AlertCircle } from 'lucide-react-native';
import { COLORS, SignalType, getSignalColor, getSignalTint } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/fonts';
import SignalBadge from '@/components/ui/SignalBadge';
import AIInsightCard from '@/components/ui/AIInsightCard';
import IndicatorRow from '@/components/stock/IndicatorRow';
import ChartContainer from '@/components/charts/ChartContainer';
import { useAppStore } from '@/store/useAppStore';
import { useStockQuote } from '@/hooks/useStockQuote';
import { useAnalysis } from '@/hooks/useAnalysis';
import { MOCK_STOCKS } from '@/constants/mockData';

export default function StockDetailScreen() {
  const params = useLocalSearchParams();
  const symbol = params.symbol as string;
  const router = useRouter();

  const mode     = useAppStore(s => s.mode);
  const watchlist = useAppStore(s => s.watchlist);
  const isAdvanced = mode === 'advanced';

  const stockMeta = MOCK_STOCKS.find((s) => s.symbol === symbol);

  const { stock, isLoading: quoteLoading, refresh: refreshQuote } = useStockQuote(symbol ?? '');
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

  const signal: SignalType = (analysis?.signal ?? 'neutral') as SignalType;
  const confidence         = analysis?.confidence ?? 0;

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

  const watchForText = isAdvanced
    ? `MA50: ${maVsLabel} · Trend: ${trendLabel} · Volume: ${volLabel}`
    : signal === 'bullish'
    ? 'Watch for volume increasing to confirm the move'
    : signal === 'bearish'
    ? 'Watch for price stabilizing before considering entry'
    : 'Wait for a clear signal before taking action';

  const handleToggleWatchlist = () => {
    const { addToWatchlist, removeFromWatchlist } = useAppStore.getState();
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
          <ChevronLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stockMeta?.name ?? symbol}</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleToggleWatchlist}>
          <Star
            size={18}
            color={isSaved ? COLORS.bullish : COLORS.textMuted}
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
          <View style={[styles.changePill, { backgroundColor: getSignalTint(signal) }]}>
            {!quoteLoading && <View style={[styles.liveDot, { backgroundColor: getSignalColor(signal) }]} />}
            {quoteLoading ? (
              <ActivityIndicator size="small" color={getSignalColor(signal)} />
            ) : (
              <Text style={[styles.changePillText, { color: getSignalColor(signal) }]}>
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
              ? <ActivityIndicator size="small" color={COLORS.textMuted} />
              : <RefreshCw size={14} color={COLORS.textMuted} />
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

        {/* ── AI Insight — FIRST AND PRIMARY ── */}
        <View style={styles.section}>
          <AIInsightCard
            signal={signal}
            confidence={confidence}
            explanation={explanationText}
            mode={isAdvanced ? 'advanced' : 'beginner'}
            watchFor={watchForText}
          />
        </View>

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
              <IndicatorRow label="RSI (14)"       value={rsi !== null ? rsi : '—'}  signal={rsi !== null ? (rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : 'neutral') : 'neutral'} />
              <IndicatorRow label="MACD"            value={macdSignal}                signal={macdSignal === 'Bullish' ? 'bullish' : macdSignal === 'Bearish' ? 'bearish' : 'neutral'} />
              <IndicatorRow label="vs MA 50"        value={maVsLabel}                 signal={maVsLabel === 'Above' ? 'bullish' : maVsLabel === 'Below' ? 'bearish' : 'neutral'} />
              <IndicatorRow label="Volume"          value={volLabel}                  signal={volLabel === 'High' ? 'bullish' : volLabel === 'Low' ? 'bearish' : 'neutral'} />
              <IndicatorRow label="Trend Strength"  value={trendLabel}                signal={trendLabel === 'Strong' ? 'bullish' : trendLabel === 'Weak' ? 'bearish' : 'neutral'} divider={false} />
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
            <AlertCircle size={11} color={COLORS.textFaint} />
            <Text style={styles.disclaimerText}>Historical context only — not a prediction</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: COLORS.bg },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
  iconBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { fontSize: FONT_SIZE.sm, fontFamily: FONTS.medium, color: COLORS.textSub, letterSpacing: 0.05 },
  content:        { paddingHorizontal: 20, paddingTop: 8 },
  priceHero:      { alignItems: 'center', paddingTop: 16, paddingBottom: 12 },
  symbolLabel:    { fontSize: FONT_SIZE.xs, fontFamily: FONTS.semiBold, color: COLORS.textFaint, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  priceNumber:    { fontSize: FONT_SIZE.hero, fontFamily: FONTS.bold, color: COLORS.textPrimary, letterSpacing: -2, lineHeight: 56 },
  changePill:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 100, marginTop: 10, minHeight: 32 },
  liveDot:        { width: 6, height: 6, borderRadius: 3 },
  changePillText: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.semiBold },
  signalRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  refreshBtn:     { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center' },
  errorBanner:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.bearishBg, borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: COLORS.bearishBorder },
  errorText:      { fontSize: FONT_SIZE.xs, fontFamily: FONTS.medium, color: COLORS.bearish, flex: 1 },
  section:        { marginBottom: 14 },
  card:           { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  sectionLabel:   { fontSize: FONT_SIZE.xs, fontFamily: FONTS.bold, color: COLORS.textFaint, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  historicalText: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.regular, color: COLORS.textSub, lineHeight: 22, marginBottom: 10 },
  disclaimerRow:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  disclaimerText: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.regular, color: COLORS.textFaint },
  shimmerGroup:   { gap: 12 },
  shimmer:        { height: 12, borderRadius: 6, backgroundColor: COLORS.bgElevated },
  notFound:       { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText:   { fontSize: FONT_SIZE.sm, fontFamily: FONTS.medium, color: COLORS.textSub },
  backBtn:        { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.bgCard, borderRadius: 10 },
  backBtnText:    { fontSize: FONT_SIZE.sm, fontFamily: FONTS.semiBold, color: COLORS.bullish },
});