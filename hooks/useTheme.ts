import { useAppStore } from "@/store/useAppStore";

export const lightColors = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  cardElevated: "#F1F5F9",
  border: "#E2E8F0",
  text: "#0A0A0A",
  subtext: "#64748B",
  muted: "#94A3B8",
};

export const darkColors = {
  bg: "#0A0A0A",
  card: "#141414",
  cardElevated: "#1A1A1A",
  border: "#222222",
  text: "#FFFFFF",
  subtext: "#888888",
  muted: "#555555",
};

export const sharedColors = {
  primary: "#4F46E5",
  bullish: "#10B981",
  bearish: "#F43F5E",
  neutral: "#71717A",
};

export function useTheme() {
  const { theme } = useAppStore();
  const isDark = theme === "dark";
  const colors = isDark ? darkColors : lightColors;

  return {
    theme,
    isDark,
    colors: { ...colors, ...sharedColors },
  };
}