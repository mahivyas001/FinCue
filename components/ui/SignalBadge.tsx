import { View, Text } from "react-native";
import { Signal } from "@/types/stock";

interface SignalBadgeProps {
  signal: Signal;
  confidence?: number;
  size?: "sm" | "md";
}

export default function SignalBadge({
  signal,
  confidence,
  size = "md",
}: SignalBadgeProps) {
  const config = {
    bullish: { color: "#10B981", label: "Bullish" },
    bearish: { color: "#F43F5E", label: "Bearish" },
    neutral: { color: "#71717A", label: "Neutral" },
  }[signal];

  const fontSize = size === "sm" ? 10 : 12;
  const dotSize = size === "sm" ? 5 : 6;
  const px = size === "sm" ? 8 : 10;
  const py = size === "sm" ? 3 : 5;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: `${config.color}15`,
        paddingHorizontal: px,
        paddingVertical: py,
        borderRadius: 999,
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: `${config.color}30`,
      }}
    >
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: 999,
          backgroundColor: config.color,
        }}
      />
      <Text
        style={{
          color: config.color,
          fontSize,
          fontFamily: "Poppins_600SemiBold",
        }}
      >
        {config.label}
        {confidence !== undefined ? ` · ${confidence}%` : ""}
      </Text>
    </View>
  );
}