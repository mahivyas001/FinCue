import { View, Text, TouchableOpacity } from "react-native";
import { useAppStore } from "@/store/useAppStore";

const FILTERS = [
  { label: "All Markets", value: "ALL" },
  { label: "🇺🇸 US", value: "US" },
  { label: "🇮🇳 India", value: "IN" },
] as const;

export default function MarketFilterBar() {
  const { marketFilter, setMarketFilter } = useAppStore();

  return (
    <View className="flex-row gap-2 mb-4">
      {FILTERS.map((filter) => {
        const isActive = marketFilter === filter.value;
        return (
          <TouchableOpacity
            key={filter.value}
            onPress={() => setMarketFilter(filter.value)}
            className={`px-4 py-1.5 rounded-full border ${
              isActive
                ? "bg-primary border-primary"
                : "bg-transparent border-darkCard"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isActive ? "text-white" : "text-neutral"
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}