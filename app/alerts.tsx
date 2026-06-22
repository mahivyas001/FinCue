// app/alerts.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Trash2,
  Bell,
  TrendingUp,
  TrendingDown,
  Gauge,
  Activity,
  ChevronRight,
} from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { FONTS, FONT_SIZE } from "@/constants/fonts";
import { useAppStore } from "@/store/useAppStore";
import {
  fetchRecentAlerts,
  clearRecentAlerts,
  triggerAlertsCheck,
  AlertEvent,
} from "@/lib/api/alerts";

function getRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSecs < 10) return "just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}

export default function AlertsScreen() {
  const router = useRouter();
  const pushToken = useAppStore((s) => s.pushToken);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [triggeringCheck, setTriggeringCheck] = useState(false);

  const loadAlerts = useCallback(
    async (showLoading = true) => {
      if (!pushToken) {
        setLoading(false);
        return;
      }
      if (showLoading) setLoading(true);
      try {
        const list = await fetchRecentAlerts(pushToken);
        // Sort by triggered_at descending
        const sorted = list.sort(
          (a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
        );
        setAlerts(sorted);
      } catch (err) {
        console.error("[AlertsScreen] Error loading alerts:", err);
      } finally {
        setLoading(false);
      }
    },
    [pushToken]
  );

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlerts(false);
    setRefreshing(false);
  };

  const handleClearAll = async () => {
    if (!pushToken) return;
    try {
      await clearRecentAlerts(pushToken);
      setAlerts([]);
    } catch (err) {
      console.error("[AlertsScreen] Error clearing alerts:", err);
    }
  };

  const handleTriggerCheck = async () => {
    setTriggeringCheck(true);
    try {
      // Step 1: Tell backend to run the check
      await triggerAlertsCheck();
      // Wait 1.5 seconds for the async backend worker check to populate DB/store
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Step 2: Reload recent alerts list
      await loadAlerts(false);
    } catch (err) {
      console.error("[AlertsScreen] Error triggering alert check:", err);
    } finally {
      setTriggeringCheck(false);
    }
  };

  const renderAlertIcon = (alert: AlertEvent) => {
    const isBullish = alert.message.includes("Bullish") || alert.message.includes("oversold");
    const tintColor = isBullish ? COLORS.bullish : COLORS.bearish;
    const bgStyle = { backgroundColor: isBullish ? COLORS.bullishBg : COLORS.bearishBg };

    switch (alert.alert_type) {
      case "signal_flip":
        return (
          <View style={[styles.iconContainer, bgStyle]}>
            {isBullish ? (
              <TrendingUp size={18} color={tintColor} />
            ) : (
              <TrendingDown size={18} color={tintColor} />
            )}
          </View>
        );
      case "rsi_extreme":
        return (
          <View style={[styles.iconContainer, bgStyle]}>
            <Gauge size={18} color={tintColor} />
          </View>
        );
      case "volume_spike":
        return (
          <View style={[styles.iconContainer, bgStyle]}>
            <Activity size={18} color={tintColor} />
          </View>
        );
      default:
        return (
          <View style={[styles.iconContainer, { backgroundColor: COLORS.appBg.elevated }]}>
            <Bell size={18} color={COLORS.textPrimary.dim} />
          </View>
        );
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <ChevronLeft size={20} color={COLORS.textPrimary.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Signal Alerts</Text>
        <TouchableOpacity
          style={[styles.iconBtn, alerts.length === 0 && styles.disabledBtn]}
          onPress={handleClearAll}
          disabled={alerts.length === 0}
          activeOpacity={0.75}
        >
          <Trash2
            size={16}
            color={alerts.length === 0 ? COLORS.textPrimary.faint : COLORS.bearish}
          />
        </TouchableOpacity>
      </View>

      {/* Manual testing trigger banner */}
      <View style={styles.testBanner}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.testTitle}>Live Alert Detector</Text>
          <Text style={styles.testSub}>
            Trigger a manual check on the server to scan your watchlist symbols immediately.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.testBtn, triggeringCheck && styles.testBtnLoading]}
          onPress={handleTriggerCheck}
          disabled={triggeringCheck}
          activeOpacity={0.8}
        >
          {triggeringCheck ? (
            <ActivityIndicator size="small" color={COLORS.appBg.base} />
          ) : (
            <Text style={styles.testBtnText}>Scan Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.bullish} />
          <Text style={styles.loadingText}>Fetching recent alerts...</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.bullish}
            />
          }
        >
          {alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Bell size={36} color={COLORS.textPrimary.faint} />
              </View>
              <Text style={styles.emptyTitle}>No Alerts Triggered</Text>
              <Text style={styles.emptyText}>
                FinCue scans your watchlist for RSI levels, MACD flips, and Volume spikes. When a condition triggers, it will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.alertsList}>
              {alerts.map((alert, idx) => {
                const isBull = alert.message.includes("Bullish") || alert.message.includes("oversold");
                const cardBorderColor = isBull ? COLORS.bullishBorder : COLORS.bearishBorder;

                return (
                  <TouchableOpacity
                    key={`${alert.symbol}-${alert.triggered_at}-${idx}`}
                    style={[styles.alertCard, { borderColor: cardBorderColor }]}
                    onPress={() => router.push(`/stock/${alert.symbol}`)}
                    activeOpacity={0.8}
                  >
                    {renderAlertIcon(alert)}
                    <View style={styles.alertDetails}>
                      <View style={styles.alertHeader}>
                        <Text style={styles.alertSymbol}>{alert.symbol}</Text>
                        <Text style={styles.alertTime}>
                          {getRelativeTime(alert.triggered_at)}
                        </Text>
                      </View>
                      <Text style={styles.alertMsg}>{alert.message}</Text>
                    </View>
                    <ChevronRight size={16} color={COLORS.textPrimary.faint} style={styles.chevron} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.appBg.base,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.appBg.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: FONT_SIZE.base,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary.primary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Test banner
  testBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
    gap: 12,
  },
  testTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textPrimary.primary,
  },
  testSub: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textPrimary.dim,
    lineHeight: 15,
  },
  testBtn: {
    backgroundColor: COLORS.bullish,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  testBtnLoading: {
    backgroundColor: COLORS.appBg.elevated,
  },
  testBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.appBg.base,
  },

  // Loading / Center Container
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary.muted,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
    gap: 16,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.appBg.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary.primary,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary.dim,
    textAlign: "center",
    lineHeight: 22,
  },

  // Alert Cards List
  alertsList: {
    gap: 10,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.appBg.card,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  alertDetails: {
    flex: 1,
    gap: 3,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertSymbol: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary.primary,
  },
  alertTime: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textPrimary.faint,
  },
  alertMsg: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textPrimary.dim,
    lineHeight: 18,
  },
  chevron: {
    marginLeft: 4,
  },
});
