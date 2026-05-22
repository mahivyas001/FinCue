import { View, Text, ActivityIndicator } from "react-native";
import { Signal } from "@/types/stock";
import { useTheme } from "@/hooks/useTheme";

interface AIInsightCardProps {
  symbol: string;
  signal: Signal;
  confidence: number;
  explanation: string | null;
  isLoading?: boolean;
  isBeginnerMode?: boolean;
}

export default function AIInsightCard({
  symbol,
  signal,
  confidence,
  explanation,
  isLoading = false,
  isBeginnerMode = true,
}: AIInsightCardProps) {
  const { colors } = useTheme();

  const signalColor =
    signal === "bullish" ? "#10B981"
    : signal === "bearish" ? "#F43F5E"
    : "#71717A";

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: `${signalColor}25`,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: "#4F46E515",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 14 }}>✦</Text>
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: 13,
              fontFamily: "Poppins_600SemiBold",
            }}
          >
            AI Insight — {symbol}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: `${signalColor}15`,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: `${signalColor}30`,
          }}
        >
          <Text
            style={{
              color: signalColor,
              fontSize: 10,
              fontFamily: "SpaceGrotesk_600SemiBold",
            }}
          >
            {confidence}% confidence
          </Text>
        </View>
      </View>

      {/* Explanation */}
      {isLoading ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={{ color: colors.subtext, fontSize: 13, fontFamily: "Poppins_400Regular" }}>
            Analyzing indicators...
          </Text>
        </View>
      ) : (
        <Text
          style={{
            color: colors.subtext,
            fontSize: 13,
            fontFamily: "Poppins_400Regular",
            lineHeight: 20,
          }}
        >
          {explanation ?? "Analysis unavailable."}
        </Text>
      )}

      {/* Mode label */}
      {!isLoading && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 }}>
          <Text style={{ color: colors.muted, fontSize: 10, fontFamily: "Poppins_400Regular" }}>
            {isBeginnerMode ? "🟢 Beginner-friendly" : "⚡ Technical summary"}
          </Text>
        </View>
      )}
    </View>
  );
}