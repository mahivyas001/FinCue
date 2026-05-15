import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import type { Stock } from "@/types/stock";
import SignalBadge from "@/components/ui/SignalBadge";

interface StockCardProps {
  stock: Stock;
}

export default function StockCard({ stock }: StockCardProps) {
  const router = useRouter();

  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? "text-bullish" : "text-bearish";
  const changePrefix = isPositive ? "+" : "";
  const currencySymbol = stock.market === "IN" ? "₹" : "$";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/stock/${stock.symbol}`)}
      className="bg-darkCard rounded-2xl p-4 mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
            <Text className="text-primary font-bold text-sm">
              {stock.symbol.slice(0, 2)}
            </Text>
          </View>
          <View>
            <Text className="text-white font-semibold text-sm">
              {stock.symbol}
            </Text>
            <Text className="text-neutral text-xs" numberOfLines={1}>
              {stock.name}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-white font-bold text-sm">
            {currencySymbol}
            {stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </Text>
          <Text className={`${changeColor} text-sm font-medium`}>
  {changePrefix}{stock.change.toFixed(2)} ({changePrefix}{stock.changePercent.toFixed(2)}%)
</Text>
        </View>
      </View>

      <SignalBadge
        signal={stock.signal}
        confidence={stock.confidence}
        size="sm"
      />
    </TouchableOpacity>
  );
}