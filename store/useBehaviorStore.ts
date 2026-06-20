// store/useBehaviorStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import {
  SymbolEvents,
  BehaviorInsight,
  detectRecencyChasing,
  detectCompulsiveChecking,
  detectConfirmationSeeking
} from '@/lib/analysis/biasDetectors';

interface BehaviorState {
  events: Record<string, SymbolEvents>;
  sessionViews: Record<string, number[]>; // symbol -> array of timestamps, not persisted
  dismissedInsightIds: string[];
  activeInsights: BehaviorInsight[];

  recordView: (symbol: string, price: number) => void;
  recordWatchlistAdd: (
    symbol: string,
    price: number,
    signal: 'Bullish' | 'Bearish' | 'Neutral',
    changePercent: number
  ) => void;
  dismissInsight: (id: string) => void;
  clearSessionViews: () => void;
}

const storage = createJSONStorage(() => ({
  getItem:    (name: string) => SecureStore.getItemAsync(name),
  setItem:    (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
}));

function recomputeInsights(
  events: Record<string, SymbolEvents>,
  sessionViews: Record<string, number[]>,
  dismissed: string[]
): BehaviorInsight[] {
  const insights: BehaviorInsight[] = [];

  // 1. Check user-pattern-wide confirmation seeking
  const conf = detectConfirmationSeeking(events);
  if (conf && !dismissed.includes(conf.id)) {
    insights.push(conf);
  }

  // 2. Check symbol-specific insights
  for (const symbol of Object.keys(events)) {
    const symbolEvents = events[symbol];
    const symSession = sessionViews[symbol] || [];

    // Recency chasing check
    const recency = detectRecencyChasing(symbol, symbolEvents);
    if (recency && !dismissed.includes(recency.id)) {
      insights.push(recency);
    }

    // Compulsive checking check
    const compulsive = detectCompulsiveChecking(symbol, symSession, symbolEvents.views || []);
    if (compulsive && !dismissed.includes(compulsive.id)) {
      insights.push(compulsive);
    }
  }

  return insights;
}

const getOrInitSymbolEvents = (events: Record<string, SymbolEvents>, symbol: string): SymbolEvents => {
  if (!events[symbol]) {
    events[symbol] = { views: [], watchlistAdds: [] };
  }
  return events[symbol];
};

export const useBehaviorStore = create<BehaviorState>()(
  persist(
    (set, get) => ({
      events: {},
      sessionViews: {},
      dismissedInsightIds: [],
      activeInsights: [],

      recordView: (symbol, price) => {
        const now = Date.now();
        
        // Deep copy events structure
        const events = { ...get().events };
        const symbolEvents = { ...getOrInitSymbolEvents(events, symbol) };
        symbolEvents.views = [...(symbolEvents.views || []), { timestamp: now, price }];
        events[symbol] = symbolEvents;

        // Update transient session views
        const sessionViews = { ...get().sessionViews };
        sessionViews[symbol] = [...(sessionViews[symbol] || []), now];

        // Recompute active insights
        const activeInsights = recomputeInsights(events, sessionViews, get().dismissedInsightIds);

        set({ events, sessionViews, activeInsights });
      },

      recordWatchlistAdd: (symbol, price, signal, changePercent) => {
        const now = Date.now();

        // Deep copy events structure
        const events = { ...get().events };
        const symbolEvents = { ...getOrInitSymbolEvents(events, symbol) };
        symbolEvents.watchlistAdds = [
          ...(symbolEvents.watchlistAdds || []),
          { timestamp: now, price, signal, changePercent }
        ];
        events[symbol] = symbolEvents;

        // Recompute active insights
        const activeInsights = recomputeInsights(events, get().sessionViews, get().dismissedInsightIds);

        set({ events, activeInsights });
      },

      dismissInsight: (id) => {
        const dismissedInsightIds = [...get().dismissedInsightIds, id];
        const activeInsights = get().activeInsights.filter((ins) => ins.id !== id);
        set({ dismissedInsightIds, activeInsights });
      },

      clearSessionViews: () => {
        set({ sessionViews: {} });
      },
    }),
    {
      name: 'fincue-behavior-store',
      storage,
      // Only persist events, dismissedInsightIds, and activeInsights. Omit sessionViews.
      partialize: (state) => ({
        events: state.events,
        dismissedInsightIds: state.dismissedInsightIds,
        activeInsights: state.activeInsights,
      }),
    }
  )
);
