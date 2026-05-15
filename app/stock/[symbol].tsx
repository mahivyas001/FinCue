import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { MOCK_STOCKS, MOCK_STOCK_DETAILS } from "@/constants/mockData";
import SignalBadge from "@/components/ui/SignalBadge";
import AIInsightCard from "@/components/ui/AIInsightCard";
import IndicatorRow from "@/components/stock/IndicatorRow";

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const { mode, watchlist, addToWatchlist, removeFromWatchlist } = useAppStore();

  const stock = MOCK_STOCKS.find((s) => s.symbol === symbol);
  const detail = MOCK_STOCK_DETAILS[symbol ?? ""];

  const isWatchlisted = watchlist.some((item) => item.symbol === symbol);
  const isPositive = (stock?.change ?? 0) >= 0;
  const changeColor = isPositive ? "text-bullish" : "text-bearish";
  const changePrefix = isPositive ? "+" : "";
  const currencySymbol = stock?.market === "IN" ? "₹" : "$";

  if (!stock || !detail) {
    return (
      <View className="flex-1 bg-darkBg items-center justify-center px-6">
        <Text className="text-white text-lg font-bold mb-2">Stock not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary text-sm">← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const indicators = [
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
      label: "MACD",
      value:
        detail.indicators.macd.charAt(0).toUpperCase() +
        detail.indicators.macd.slice(1),
      status: detail.indicators.macd,
    },
    {
      label: "Moving Average",
      value:
        detail.indicators.movingAvg === "above"
          ? "Above MA ↑"
          : "Below MA ↓",
      status:
        detail.indicators.movingAvg === "above" ? "bullish" : "bearish",
    },
    {
      label: "Volume",
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
  ] as const;

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
                {stock.symbol.slice(0, 2)}
              </Text>
            </View>
            <View>
              <Text className="text-white text-lg font-bold">{stock.symbol}</Text>
              <Text className="text-neutral text-xs">{stock.name}</Text>
            </View>
          </View>

          <Text className="text-white text-3xl font-bold mt-3">
            {currencySymbol}
            {stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </Text>
          <Text className={`${changeColor} text-sm mt-1`}>
            {changePrefix}{stock.change.toFixed(2)} ({changePrefix}
            {stock.changePercent.toFixed(2)}%) today
          </Text>
        </View>

        {/* Watchlist button */}
        <TouchableOpacity
          onPress={() =>
            isWatchlisted
              ? removeFromWatchlist(stock.symbol)
              : addToWatchlist(stock.symbol)
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
      </View>

      {/* Signal badge */}
      <View className="mb-6">
        <SignalBadge
          signal={stock.signal}
          confidence={stock.confidence}
          size="md"
        />
      </View>

      {/* AI Insight */}
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

      {/* Technical Indicators */}
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

      {/* Historical context */}
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
    </ScrollView>
  );
}