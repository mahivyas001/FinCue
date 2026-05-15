import { View, Text, ScrollView } from "react-native";
import { MOCK_STOCKS } from "@/constants/mockData";
import { useAppStore } from "@/store/useAppStore";
import StockCard from "@/components/stock/StockCard";
import MarketFilterBar from "@/components/ui/MarketFilterBar";

export default function HomeScreen() {
  const { mode, marketFilter } = useAppStore();

  const filtered = MOCK_STOCKS.filter(
    (s) => marketFilter === "ALL" || s.market === marketFilter
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
      <View className="mb-6">
        <Text className="text-white text-2xl font-bold">Market</Text>
        <Text className="text-neutral text-xs mt-1">
          {mode === "beginner" ? "Beginner Mode" : "Advanced Mode"}
        </Text>
      </View>

      {/* Filter bar */}
      <MarketFilterBar />

      {/* Stock list */}
      <View className="mt-4">
        {filtered.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} />
        ))}
      </View>
    </ScrollView>
  );
}