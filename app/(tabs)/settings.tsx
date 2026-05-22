import { View, Text, TouchableOpacity, Switch, ScrollView } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/hooks/useTheme";

export default function SettingsScreen() {
  const { mode, setMode, toggleTheme } = useAppStore();
  const { colors, isDark } = useTheme();
  const isAdvanced = mode === "advanced";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={{ color: colors.text, fontSize: 26, fontFamily: "SpaceGrotesk_700Bold", marginBottom: 4 }}>
        Settings
      </Text>
      <Text style={{ color: colors.subtext, fontSize: 12, fontFamily: "Poppins_400Regular", marginBottom: 32 }}>
        Customize your FinCue experience.
      </Text>

      {/* Appearance section */}
      <Text style={{ color: colors.muted, fontSize: 10, fontFamily: "Poppins_600SemiBold", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
        Appearance
      </Text>

      {/* Theme toggle */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ color: colors.text, fontSize: 14, fontFamily: "Poppins_600SemiBold" }}>
            {isDark ? "Dark Mode" : "Light Mode"}
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 2 }}>
            {isDark ? "Easy on the eyes at night" : "Clean and bright interface"}
          </Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: "#E2E8F0", true: "#4F46E5" }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Mode section */}
      <Text style={{ color: colors.muted, fontSize: 10, fontFamily: "Poppins_600SemiBold", letterSpacing: 1, marginBottom: 8, marginTop: 24, textTransform: "uppercase" }}>
        Analysis Mode
      </Text>

      {/* Mode toggle */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ color: colors.text, fontSize: 14, fontFamily: "Poppins_600SemiBold" }}>
            {isAdvanced ? "Advanced Mode" : "Beginner Mode"}
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 2 }}>
            {isAdvanced
              ? "Technical indicators and detailed analysis"
              : "Plain English explanations and guided insights"}
          </Text>
        </View>
        <Switch
          value={isAdvanced}
          onValueChange={(val) => setMode(val ? "advanced" : "beginner")}
          trackColor={{ false: "#E2E8F0", true: "#4F46E5" }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Mode cards */}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
        <TouchableOpacity
          onPress={() => setMode("beginner")}
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: !isAdvanced ? "#4F46E5" : colors.border,
          }}
        >
          <Text style={{ fontSize: 20, marginBottom: 6 }}>🟢</Text>
          <Text style={{ color: colors.text, fontSize: 13, fontFamily: "Poppins_600SemiBold", marginBottom: 4 }}>
            Beginner
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 11, fontFamily: "Poppins_400Regular" }}>
            Simple explanations. Great for learning.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode("advanced")}
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: isAdvanced ? "#4F46E5" : colors.border,
          }}
        >
          <Text style={{ fontSize: 20, marginBottom: 6 }}>⚡</Text>
          <Text style={{ color: colors.text, fontSize: 13, fontFamily: "Poppins_600SemiBold", marginBottom: 4 }}>
            Advanced
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 11, fontFamily: "Poppins_400Regular" }}>
            Full indicators. For active traders.
          </Text>
        </TouchableOpacity>
      </View>

      {/* Data section */}
      <Text style={{ color: colors.muted, fontSize: 10, fontFamily: "Poppins_600SemiBold", letterSpacing: 1, marginBottom: 8, marginTop: 24, textTransform: "uppercase" }}>
        Data Sources
      </Text>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 12,
        }}
      >
        {[
          { label: "Price Data", value: "Alpha Vantage" },
          { label: "Analysis Engine", value: "FinCue Backend" },
          { label: "Signals", value: "RSI · MACD · ADX" },
        ].map((item) => (
          <View key={item.label} style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: colors.subtext, fontSize: 12, fontFamily: "Poppins_400Regular" }}>
              {item.label}
            </Text>
            <Text style={{ color: colors.text, fontSize: 12, fontFamily: "Poppins_500Medium" }}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      {/* About */}
      <Text style={{ color: colors.muted, fontSize: 10, fontFamily: "Poppins_600SemiBold", letterSpacing: 1, marginBottom: 8, marginTop: 24, textTransform: "uppercase" }}>
        About
      </Text>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 14, fontFamily: "Poppins_600SemiBold", marginBottom: 4 }}>
          FinCue v1.0.0
        </Text>
        <Text style={{ color: colors.subtext, fontSize: 11, fontFamily: "Poppins_400Regular", lineHeight: 16 }}>
          AI-powered market analysis assistant. Not a brokerage. Not financial advice. Always do your own research.
        </Text>
      </View>
    </ScrollView>
  );
}