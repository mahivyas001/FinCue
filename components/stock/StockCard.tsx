import { TouchableOpacity, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Stock } from "@/types/stock";
import SignalBadge from "@/components/ui/SignalBadge";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/hooks/useTheme";

interface StockCardProps {
  stock: Stock;
}

export default function StockCard({ stock }: StockCardProps) {
  const router = useRouter();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useAppStore();
  const { colors } = useTheme();

  const isWatchlisted = watchlist.some((item) => item.symbol === stock.symbol);
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? "#10B981" : "#F43F5E";
  const changePrefix = isPositive ? "+" : "";
  const currencySymbol = stock.market === "IN" ? "₹" : "$";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/stock/${stock.symbol}`)}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Top row */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {/* Avatar */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#4F46E510",
              borderWidth: 1,
              borderColor: "#4F46E530",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#4F46E5",
                fontSize: 12,
                fontFamily: "SpaceGrotesk_700Bold",
              }}
            >
              {stock.symbol.slice(0, 2)}
            </Text>
          </View>

          {/* Symbol + name */}
          <View>
            <Text
              style={{
                color: colors.text,
                fontSize: 15,
                fontFamily: "SpaceGrotesk_600SemiBold",
              }}
            >
              {stock.symbol}
            </Text>
            <Text
              style={{
                color: colors.subtext,
                fontSize: 11,
                fontFamily: "Poppins_400Regular",
              }}
              numberOfLines={1}
            >
              {stock.name}
            </Text>
          </View>
        </View>

        {/* Watchlist star */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            isWatchlisted
              ? removeFromWatchlist(stock.symbol)
              : addToWatchlist(stock.symbol);
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            backgroundColor: colors.cardElevated,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 14 }}>
            {isWatchlisted ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom row */}
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View>
          <Text
            style={{
              color: colors.text,
              fontSize: 24,
              fontFamily: "SpaceGrotesk_700Bold",
              lineHeight: 28,
            }}
          >
            {currencySymbol}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </Text>
          <Text
            style={{
              color: changeColor,
              fontSize: 12,
              fontFamily: "SpaceGrotesk_500Medium",
              marginTop: 2,
            }}
          >
            {changePrefix}{stock.change.toFixed(2)} ({changePrefix}{stock.changePercent.toFixed(2)}%)
          </Text>
        </View>

        <SignalBadge signal={stock.signal} confidence={stock.confidence} size="sm" />
      </View>
    </TouchableOpacity>
  );
}