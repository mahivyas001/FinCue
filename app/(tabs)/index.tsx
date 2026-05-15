import StockCard from "@/components/stock/StockCard";
import { MOCK_STOCKS } from "@/constants/mockData";
import { useAppStore } from "@/store/useAppStore";
import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const { mode } = useAppStore();

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

      <Text className="text-white font-semibold text-base mb-3">
        Market Overview
      </Text>

      {MOCK_STOCKS.map((stock) => (
        <StockCard key={stock.symbol} stock={stock} />
      ))}
    </ScrollView>
  );
}
