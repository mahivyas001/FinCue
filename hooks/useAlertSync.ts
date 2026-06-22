// hooks/useAlertSync.ts

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { registerWatchlist } from '@/lib/api/alerts';

/**
 * Custom hook that listens to changes in the watchlist, pushToken, and alertsEnabled
 * states. It debounces synchronization calls by 1 second to batch rapid changes.
 */
export function useAlertSync() {
  const watchlist = useAppStore((s) => s.watchlist);
  const pushToken = useAppStore((s) => s.pushToken);
  const alertsEnabled = useAppStore((s) => s.alertsEnabled);

  useEffect(() => {
    // If pushToken is not available yet, we cannot sync watch states.
    if (!pushToken) {
      return;
    }

    const handler = setTimeout(async () => {
      try {
        if (alertsEnabled) {
          console.log(`[useAlertSync] Syncing active watchlist symbols:`, watchlist);
          await registerWatchlist(pushToken, watchlist);
        } else {
          console.log(`[useAlertSync] Alerts disabled. Unregistering (syncing empty watchlist)`);
          await registerWatchlist(pushToken, []);
        }
      } catch (err) {
        console.error('[useAlertSync] Watchlist synchronization failed:', err);
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [watchlist, pushToken, alertsEnabled]);
}
