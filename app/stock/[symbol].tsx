// app/stock/[symbol].tsx

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { MOCK_STOCKS } from "@/constants/mockData";
import { useStockQuote } from "@/hooks/useStockQuote";
import { useAnalysis } from "@/hooks/useAnalysis";
import SignalBadge from "@/components/ui/SignalBadge";
import AIInsightCard from "@/components/ui/AIInsightCard";
import IndicatorRow from "@/components/stock/IndicatorRow";
import ChartContainer from "@/components/charts/ChartContainer";

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const { mode, watchlist, addToWatchlist, removeFromWatchlist } = useAppStore();

  // ── Live quote ─────────────────────────────
  const { stock: liveStock, isLoading, error, lastUpdated, refresh } = useStockQuote(symbol);

  // ── Real backend analysis ──────────────────
  const {
    analysis,
    isLoading: analysisLoading,
    error: analysisError,
    refresh: refreshAnalysis,
  } = useAnalysis(symbol);

  // ── Fallback to mock ───────────────────────
  const mockStock = MOCK_STOCKS.find((s) => s.symbol === symbol);

  // Merge: live price + real signal from backend
  const stock = liveStock
    ? {
        ...liveStock,
        signal: analysis?.signal ?? mockStock?.signal ?? liveStock.signal,
        confidence: analysis?.confidence ?? mockStock?.confidence ?? liveStock.confidence,
        name: mockStock?.name ?? liveStock.name,
      }
    : mockStock
    ? {
        ...mockStock,
        signal: analysis?.signal ?? mockStock.signal,
        confidence: analysis?.confidence ?? mockStock.confidence,
      }
    : null;

  const isWatchlisted = watchlist.some((item) => item.symbol === symbol);
  const isPositive = (stock?.change ?? 0) >= 0;
  const changeColor = isPositive ? "text-bullish" : "text-bearish";
  const changePrefix = isPositive ? "+" : "";
  const currencySymbol = stock?.market === "IN" ? "₹" : "$";

  // ── Indicators from real backend ───────────
  const indicators = analysis
    ? [
        {
          label: "RSI (14)",
          value: analysis.indicators.rsi.toFixed(2),
          status:
            analysis.indicators.rsi > 70
              ? "bearish"
              : analysis.indicators.rsi < 30
              ? "bullish"
              : "neutral",
        },
        {
          label: "MACD Signal",
          value: analysis.indicators.macd_signal,
          status:
            analysis.indicators.macd_signal.toLowerCase() === "bullish"
              ? "bullish"
              : analysis.indicators.macd_signal.toLowerCase() === "bearish"
              ? "bearish"
              : "neutral",
        },
        {
          label: "vs Moving Avg",
          value: analysis.indicators.vs_moving_avg,
          status:
            analysis.indicators.vs_moving_avg.toLowerCase().includes("above")
              ? "bullish"
              : analysis.indicators.vs_moving_avg.toLowerCase().includes("below")
              ? "bearish"
              : "neutral",
        },
        {
          label: "Volume Level",
          value: analysis.indicators.volume_level,
          status:
            analysis.indicators.volume_level.toLowerCase() === "high"
              ? "bullish"
              : analysis.indicators.volume_level.toLowerCase() === "low"
              ? "bearish"
              : "neutral",
        },
        {
          label: "Trend Strength",
          value: analysis.indicators.trend_strength,
          status:
            analysis.indicators.trend_strength.toLowerCase() === "strong"
              ? "bullish"
              : analysis.indicators.trend_strength.toLowerCase() === "weak"
              ? "bearish"
              : "neutral",
        },
      ] as const
    : [];

  // ── Not found ──────────────────────────────
  if (!stock && !isLoading) {
    return (
      <View className="flex-1 bg-darkBg items-center justify-center px-6">
        <Text className="text-white text-lg font-bold mb-2">Stock not found</Text>
        {error && (
          <Text className="text-bearish text-sm text-center mb-4">{error}</Text>
        )}
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary text-sm">← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-darkBg"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-primary text-sm">← Back</Text>
      </TouchableOpacity>

      {/* Stock header */}
      <View className="flex-row items-start justify-between mb-6">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
              <Text className="text-primary font-bold text-sm">
                {symbol?.slice(0, 2)}
              </Text>
            </View>
            <View>
              <Text className="text-white text-lg font-bold">{symbol}</Text>
              <Text className="text-neutral text-xs">{stock?.name ?? "—"}</Text>
            </View>
          </View>

          {/* Price skeleton while loading */}
          {isLoading && !stock ? (
            <View className="mt-3">
              <View className="w-36 h-8 bg-darkCard rounded-lg" />
              <View className="w-24 h-4 bg-darkCard rounded mt-2" />
            </View>
          ) : (
            <>
              <Text className="text-white text-3xl font-bold mt-3">
                {currencySymbol}
                {stock?.price.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className={`${changeColor} text-sm`}>
                  {changePrefix}
                  {stock?.change.toFixed(2)} ({changePrefix}
                  {stock?.changePercent.toFixed(2)}%) today
                </Text>
                {liveStock && (
                  <View className="w-1.5 h-1.5 rounded-full bg-bullish" />
                )}
              </View>
            </>
          )}
        </View>

        {/* Watchlist + Refresh */}
        <View className="gap-2 items-end">
          <TouchableOpacity
            onPress={() =>
              isWatchlisted
                ? removeFromWatchlist(symbol!)
                : addToWatchlist(symbol!)
            }
            className={`px-4 py-2 rounded-full border ${
              isWatchlisted
                ? "border-primary bg-primary/20"
                : "border-darkCard bg-darkCard"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isWatchlisted ? "text-primary" : "text-neutral"
              }`}
            >
              {isWatchlisted ? "★ Saved" : "☆ Watch"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { refresh(); refreshAnalysis(); }}
            disabled={isLoading || analysisLoading}
            className="px-3 py-1.5 rounded-full bg-darkCard"
          >
            {isLoading || analysisLoading ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <Text className="text-neutral text-xs">↻ Refresh</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Quote error banner */}
      {error && (
        <View className="bg-bearish/10 border border-bearish/30 rounded-xl px-4 py-3 mb-4">
          <Text className="text-bearish text-xs font-semibold mb-1">
            Live data unavailable
          </Text>
          <Text className="text-neutral text-xs">{error}</Text>
          <Text className="text-neutral/50 text-xs mt-1">
            Showing last known data.
          </Text>
        </View>
      )}

      {/* Analysis error banner */}
      {analysisError && (
        <View className="bg-neutral/10 border border-neutral/30 rounded-xl px-4 py-3 mb-4">
          <Text className="text-neutral text-xs font-semibold mb-1">
            Analysis unavailable
          </Text>
          <Text className="text-neutral text-xs">{analysisError}</Text>
          <TouchableOpacity onPress={refreshAnalysis} className="mt-1">
            <Text className="text-primary text-xs">Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Last updated */}
      {lastUpdated && (
        <Text className="text-neutral/50 text-xs mb-4">
          Updated {lastUpdated.toLocaleTimeString()}
        </Text>
      )}

      {/* Chart */}
      {symbol && (
        <View className="bg-slate-900 rounded-2xl p-4 mb-6">
          <ChartContainer symbol={symbol} />
        </View>
      )}

      {/* Signal badge — from real backend */}
      {stock && (
        <View className="mb-6">
          <SignalBadge
            signal={analysis?.signal ?? stock.signal}
            confidence={analysis?.confidence ?? stock.confidence}
            size="md"
          />
        </View>
      )}

      {/* AI Insight — placeholder for Step 13 */}
      {stock && (
        <AIInsightCard
          symbol={stock.symbol}
          signal={analysis?.signal ?? stock.signal}
          confidence={analysis?.confidence ?? stock.confidence}
          explanation={
            analysisLoading
              ? "Analyzing market data..."
              : analysisError
              ? "Analysis unavailable. Showing cached insight."
              : mode === "beginner"
              ? `This stock is showing a ${analysis?.signal ?? stock.signal} signal with ${analysis?.confidence ?? stock.confidence}% confidence based on RSI, MACD, and trend indicators.`
              : `RSI: ${analysis?.indicators.rsi.toFixed(1) ?? "—"} · MACD: ${analysis?.indicators.macd_signal ?? "—"} · MA: ${analysis?.indicators.vs_moving_avg ?? "—"} · Volume: ${analysis?.indicators.volume_level ?? "—"} · Trend: ${analysis?.indicators.trend_strength ?? "—"}`
          }
          isBeginnerMode={mode === "beginner"}
        />
      )}

      {/* Technical Indicators — real backend data */}
      {analysisLoading ? (
        <View className="bg-darkCard rounded-2xl px-4 py-6 mb-4 items-center">
          <ActivityIndicator color="#4F46E5" />
          <Text className="text-neutral text-xs mt-2">
            Loading indicators...
          </Text>
        </View>
      ) : indicators.length > 0 ? (
        <View className="bg-darkCard rounded-2xl px-4 py-2 mb-4">
          <Text className="text-white font-semibold text-sm pt-3 pb-2">
            Technical Indicators
          </Text>
          {indicators.map((ind) => (
            <IndicatorRow
              key={ind.label}
              label={ind.label}
              value={ind.value}
              status={ind.status}
            />
          ))}
        </View>
      ) : null}

      {/* Historical context */}
      <View className="bg-darkCard rounded-2xl p-4">
        <Text className="text-white font-semibold text-sm mb-2">
          📊 Historical Context
        </Text>
        <Text className="text-neutral text-xs leading-5">
          Signal patterns are calculated from the last 100 days of price and
          volume data using RSI, MACD, and ADX indicators.
        </Text>
        <Text className="text-neutral/50 text-xs mt-3">
          Historical patterns do not guarantee future results.
        </Text>
      </View>
    </ScrollView>
  );
}