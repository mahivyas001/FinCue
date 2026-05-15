import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { MOCK_STOCKS, MOCK_STOCK_DETAILS } from "@/constants/mockData";
import StockCard from "@/components/stock/StockCard";
import MarketFilterBar from "@/components/ui/MarketFilterBar";
import AIInsightCard from "@/components/ui/AIInsightCard";
import { useMultipleQuotes } from "@/hooks/useStockQuote";
import { useState } from "react";

const SYMBOLS = MOCK_STOCKS.map((s) => s.symbol);

export default function HomeScreen() {
  const { mode, marketFilter } = useAppStore();
  const { quotes, loading, error, refresh } = useMultipleQuotes(SYMBOLS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Merge live quotes into mock stocks
  const enrichedStocks = MOCK_STOCKS.map((stock) => {
    const live = quotes[stock.symbol];
    if (!live) return stock;
    return {
      ...stock,
      price: live.price,
      change: live.change,
      changePercent: live.changePercent,
    };
  });

  const filteredStocks = enrichedStocks.filter((stock) =>
    marketFilter === "ALL" ? true : stock.market === marketFilter
  );

  // Pick first bullish stock for AI insight
  const featuredStock =
    enrichedStocks.find((s) => s.signal === "bullish") ?? enrichedStocks[0];
  const featuredDetail = MOCK_STOCK_DETAILS[featuredStock.symbol];

  return (
    <ScrollView
      className="flex-1 bg-darkBg"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4F46E5"
        />
      }
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-white text-2xl font-bold">FinCue ✦</Text>
          <Text className="text-neutral text-xs mt-0.5">
            Market intelligence, simplified.
          </Text>
        </View>
        <View className="bg-primary/20 px-3 py-1.5 rounded-full">
          <Text className="text-primary text-xs font-semibold">
            {mode === "beginner" ? "🟢 Beginner" : "⚡ Advanced"}
          </Text>
        </View>
      </View>

      {/* Loading state */}
      {loading && !refreshing && (
        <View className="items-center py-4 mb-2">
          <ActivityIndicator color="#4F46E5" />
          <Text className="text-neutral text-xs mt-2">
            Fetching live prices...
          </Text>
        </View>
      )}

      {/* Error state */}
      {error && (
        <View className="bg-bearish/10 border border-bearish/30 rounded-2xl p-3 mb-4">
          <Text className="text-bearish text-xs">
            Could not load live prices. Showing last known data.
          </Text>
          <TouchableOpacity onPress={refresh} className="mt-1">
            <Text className="text-primary text-xs">Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Beginner tip — only in beginner mode */}
      {mode === "beginner" && (
        <View className="bg-primary/10 border border-primary/20 rounded-2xl p-3 mb-4">
          <Text className="text-primary text-xs font-semibold mb-0.5">
            💡 Beginner Tip
          </Text>
          <Text className="text-white/70 text-xs leading-4">
            Green means the stock is up today. Red means it's down. The signal
            badge shows the overall trend — not just today's move.
          </Text>
        </View>
      )}

      {/* AI Insight */}
      {featuredDetail && (
        <AIInsightCard
          symbol={featuredStock.symbol}
          signal={featuredStock.signal}
          confidence={featuredStock.confidence}
          explanation={
            mode === "beginner"
              ? featuredDetail.beginnerExplanation
              : featuredDetail.advancedExplanation
          }
          isBeginnerMode={mode === "beginner"}
        />
      )}

      {/* Market filter + section title */}
      <Text className="text-white font-semibold text-base mb-3 mt-2">
        Market Overview
      </Text>
      <MarketFilterBar />

      {/* Stock count — advanced mode only */}
      {mode === "advanced" && (
        <Text className="text-neutral text-xs mb-3">
          {filteredStocks.length} stocks · {Object.keys(quotes).length} live prices loaded
        </Text>
      )}

      {/* Stock cards */}
      {filteredStocks.length === 0 ? (
        <View className="items-center py-12">
          <Text className="text-neutral text-sm">No stocks found.</Text>
        </View>
      ) : (
        filteredStocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} />
        ))
      )}
    </ScrollView>
  );
}