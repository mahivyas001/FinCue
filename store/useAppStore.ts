// store/useAppStore.ts
//
// FIRST: run this in your project root:
//   npx expo install expo-secure-store
//
// expo-secure-store is part of the Expo ecosystem but needs an explicit install.
// createJSONStorage() is the correct Zustand wrapper — fixes the StorageValue type mismatch.

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
}

// createJSONStorage() wraps the raw adapter so Zustand gets the correct
// StorageValue type — this is what fixes the ts(2322) incompatibility.
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
    }),
    {
      name: 'fincue-app-store',
      storage,
    }
  )
);