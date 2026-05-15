import { ScrollView, View, Text } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { MOCK_STOCKS } from "@/constants/mockData";
import StockCard from "@/components/stock/StockCard";
import MarketFilterBar from "@/components/ui/MarketFilterBar";
import AIInsightCard from "@/components/ui/AIInsightCard";

const MOCK_INSIGHT = {
  symbol: "AAPL",
  signal: "bullish" as const,
  confidence: 78,
  explanation:
    "Apple has been gaining momentum over the past few days. Buyers are stepping in consistently, and the stock is trading above its recent average price — a sign that demand is outpacing supply right now.",
};

export default function HomeScreen() {
  const { mode, marketFilter } = useAppStore();

  const filteredStocks = MOCK_STOCKS.filter((stock) =>
    marketFilter === "ALL" ? true : stock.market === marketFilter
  );

  return (
    <ScrollView
      className="flex-1 bg-darkBg"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
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
            {mode === "beginner" ? "Beginner" : "Advanced"}
          </Text>
        </View>
      </View>

      {/* AI Insight Card */}
      <AIInsightCard
        symbol={MOCK_INSIGHT.symbol}
        signal={MOCK_INSIGHT.signal}
        confidence={MOCK_INSIGHT.confidence}
        explanation={MOCK_INSIGHT.explanation}
        isBeginnerMode={mode === "beginner"}
      />

      {/* Market Filter */}
      <Text className="text-white font-semibold text-base mb-3 mt-2">
        Market Overview
      </Text>
      <MarketFilterBar />

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