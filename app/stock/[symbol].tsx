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
import { MOCK_STOCKS, MOCK_STOCK_DETAILS } from "@/constants/mockData";
import { useStockQuote } from "@/hooks/useStockQuote";
import SignalBadge from "@/components/ui/SignalBadge";
import AIInsightCard from "@/components/ui/AIInsightCard";
import IndicatorRow from "@/components/stock/IndicatorRow";
import ChartContainer from "@/components/charts/ChartContainer";

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const { mode, watchlist, addToWatchlist, removeFromWatchlist } = useAppStore();

  // ── Live data ──────────────────────────────
  const { stock: liveStock, isLoading, error, lastUpdated, refresh } = useStockQuote(symbol);

  // ── Fallback to mock ───────────────────────
  const mockStock = MOCK_STOCKS.find((s) => s.symbol === symbol);
  const detail = MOCK_STOCK_DETAILS[symbol ?? ""];

  // Merge: live price data + mock signal data
  const stock = liveStock
    ? {
        ...liveStock,
        signal: mockStock?.signal ?? liveStock.signal,
        confidence: mockStock?.confidence ?? liveStock.confidence,
        name: mockStock?.name ?? liveStock.name,
      }
    : mockStock;

  const isWatchlisted = watchlist.some((item) => item.symbol === symbol);
  const isPositive = (stock?.change ?? 0) >= 0;
  const changeColor = isPositive ? "text-bullish" : "text-bearish";
  const changePrefix = isPositive ? "+" : "";
  const currencySymbol = stock?.market === "IN" ? "₹" : "$";

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

  const indicators = detail
    ? ([
        {
          label: "RSI (14)",
          value: detail.indicators.rsi.toString(),
          status:
            detail.indicators.rsi > 70
              ? "bearish"
              : detail.indicators.rsi < 30
              ? "bullish"
              : "neutral",
        },
        {
          label: "MACD Signal",
          value:
            detail.indicators.macd.charAt(0).toUpperCase() +
            detail.indicators.macd.slice(1),
          status: detail.indicators.macd,
        },
        {
          label: "vs Moving Avg",
          value:
            detail.indicators.movingAvg === "above"
              ? "Above MA ↑"
              : "Below MA ↓",
          status:
            detail.indicators.movingAvg === "above" ? "bullish" : "bearish",
        },
        {
          label: "Volume Level",
          value:
            detail.indicators.volume.charAt(0).toUpperCase() +
            detail.indicators.volume.slice(1),
          status:
            detail.indicators.volume === "high"
              ? "bullish"
              : detail.indicators.volume === "low"
              ? "bearish"
              : "neutral",
        },
        {
          label: "Trend Strength",
          value:
            detail.indicators.trend.charAt(0).toUpperCase() +
            detail.indicators.trend.slice(1),
          status:
            detail.indicators.trend === "strong"
              ? "bullish"
              : detail.indicators.trend === "weak"
              ? "bearish"
              : "neutral",
        },
      ] as const)
    : [];

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

          {/* Price — skeleton while loading */}
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
                {/* Green dot = live data loaded */}
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
            onPress={refresh}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full bg-darkCard"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <Text className="text-neutral text-xs">↻ Refresh</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* API error banner — non-blocking */}
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

      {/* Last updated */}
      {lastUpdated && (
        <Text className="text-neutral/50 text-xs mb-4">
          Updated {lastUpdated.toLocaleTimeString()}
        </Text>
      )}

      {/* ── CHART ─────────────────────────────── */}
      {symbol && (
        <View className="bg-slate-900 rounded-2xl p-4 mb-6">
          <ChartContainer symbol={symbol} />
        </View>
      )}

      {/* Signal badge */}
      {stock && (
        <View className="mb-6">
          <SignalBadge
            signal={stock.signal}
            confidence={stock.confidence}
            size="md"
          />
        </View>
      )}

      {/* AI Insight */}
      {stock && detail && (
        <AIInsightCard
          symbol={stock.symbol}
          signal={stock.signal}
          confidence={stock.confidence}
          explanation={
            mode === "beginner"
              ? detail.beginnerExplanation
              : detail.advancedExplanation
          }
          isBeginnerMode={mode === "beginner"}
        />
      )}

      {/* Technical Indicators */}
      {indicators.length > 0 && (
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
      )}

      {/* Historical context */}
      {detail && (
        <View className="bg-darkCard rounded-2xl p-4">
          <Text className="text-white font-semibold text-sm mb-2">
            📊 Historical Context
          </Text>
          <Text className="text-neutral text-xs leading-5">
            {detail.historicalNote}
          </Text>
          <Text className="text-neutral/50 text-xs mt-3">
            Historical patterns do not guarantee future results.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}