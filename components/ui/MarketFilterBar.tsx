import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/hooks/useTheme";

const FILTERS = [
  { label: "All Markets", value: "ALL" },
  { label: "🇺🇸 US", value: "US" },
  { label: "🇮🇳 India", value: "IN" },
] as const;

export default function MarketFilterBar() {
  const { marketFilter, setMarketFilter } = useAppStore();
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 16 }}
    >
      <View style={{ flexDirection: "row", gap: 8 }}>
        {FILTERS.map((filter) => {
          const isActive = marketFilter === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              onPress={() => setMarketFilter(filter.value)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: isActive ? "#4F46E5" : colors.card,
                borderWidth: 1,
                borderColor: isActive ? "#4F46E5" : colors.border,
              }}
            >
              <Text
                style={{
                  color: isActive ? "#FFFFFF" : colors.subtext,
                  fontSize: 12,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}