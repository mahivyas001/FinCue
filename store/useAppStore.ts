// store/useAppStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

type Mode = 'beginner' | 'advanced';

interface AppState {
  mode: Mode;
  setMode: (mode: Mode) => void;

  watchlist: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;

  hasOnboarded: boolean;
  setHasOnboarded: (value: boolean) => void;

  quizzesEnabled: boolean;
  setQuizzesEnabled: (value: boolean) => void;

  pushToken: string | null;
  alertsEnabled: boolean;
  setPushToken: (token: string | null) => void;
  setAlertsEnabled: (enabled: boolean) => void;
}

const storage = createJSONStorage(() => ({
  getItem:    (name: string) => SecureStore.getItemAsync(name),
  setItem:    (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
}));

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: 'beginner',
      setMode: (mode) => set({ mode }),

      watchlist: [],
      addToWatchlist: (symbol) => {
        const { watchlist } = get();
        if (!watchlist.includes(symbol)) {
          set({ watchlist: [...watchlist, symbol] });
        }
      },
      removeFromWatchlist: (symbol) => {
        set({ watchlist: get().watchlist.filter((s) => s !== symbol) });
      },
      isInWatchlist: (symbol) => get().watchlist.includes(symbol),

      hasOnboarded: false,
      setHasOnboarded: (value) => set({ hasOnboarded: value }),

      quizzesEnabled: true,
      setQuizzesEnabled: (value) => set({ quizzesEnabled: value }),

      pushToken: null,
      alertsEnabled: false,
      setPushToken: (token) => set({ pushToken: token }),
      setAlertsEnabled: (enabled) => set({ alertsEnabled: enabled }),
    }),
    {
      name: 'fincue-app-store',
      storage,
    }
  )
);