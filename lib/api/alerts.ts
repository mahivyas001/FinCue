// lib/api/alerts.ts

import { API_CONFIG } from "@/constants/config";

export interface AlertEvent {
  push_token: string;
  symbol: string;
  alert_type: "signal_flip" | "rsi_extreme" | "volume_spike";
  message: string;
  triggered_at: string; // ISO String from backend
  acknowledged: boolean;
}

/**
 * Sync the watchlist symbols with the backend for alert monitoring.
 */
export async function registerWatchlist(pushToken: string, symbols: string[]): Promise<void> {
  const url = `${API_CONFIG.BACKEND_URL}/api/v1/alerts/register`;
  console.log(`[Alerts] Syncing watchlist for device: ${pushToken} (${symbols.length} symbols)`);
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({
      push_token: pushToken,
      symbols: symbols,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to register watchlist with backend: ${res.status} ${res.statusText}`);
  }
}

/**
 * Retrieve recent alerts generated for this device.
 */
export async function fetchRecentAlerts(pushToken: string): Promise<AlertEvent[]> {
  const url = `${API_CONFIG.BACKEND_URL}/api/v1/alerts/recent?push_token=${encodeURIComponent(pushToken)}`;
  console.log(`[Alerts] Fetching recent alerts for device: ${pushToken}`);

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch recent alerts: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Clear recent alerts history for this device on the backend.
 */
export async function clearRecentAlerts(pushToken: string): Promise<void> {
  const url = `${API_CONFIG.BACKEND_URL}/api/v1/alerts/clear`;
  console.log(`[Alerts] Clearing recent alerts for device: ${pushToken}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({
      push_token: pushToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to clear recent alerts: ${res.status} ${res.statusText}`);
  }
}

/**
 * Synchronously trigger an alert check loop on the backend (utility/test helper).
 */
export async function triggerAlertsCheck(): Promise<void> {
  const url = `${API_CONFIG.BACKEND_URL}/api/v1/alerts/check`;
  console.log("[Alerts] Triggering manual alert check...");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to trigger manual alert check: ${res.status} ${res.statusText}`);
  }
}
