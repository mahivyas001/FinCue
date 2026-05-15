import { Signal } from "@/types";
import { Text, View } from "react-native";

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
    bullish: { bg: "bg-bullish/20", text: "text-bullish", label: "Bullish" },
    bearish: { bg: "bg-bearish/20", text: "text-bearish", label: "Bearish" },
    neutral: { bg: "bg-neutral/20", text: "text-neutral", label: "Neutral" },
  }[signal];

  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const padding = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";

  return (
    <View
      className={`${config.bg} ${padding} rounded-full flex-row items-center gap-1`}
    >
      <View
        className={`w-1.5 h-1.5 rounded-full ${
          signal === "bullish"
            ? "bg-bullish"
            : signal === "bearish"
              ? "bg-bearish"
              : "bg-neutral"
        }`}
      />
      <Text className={`${config.text} ${textSize} font-semibold`}>
        {config.label}
        {confidence !== undefined ? ` · ${confidence}%` : ""}
      </Text>
    </View>
  );
}
