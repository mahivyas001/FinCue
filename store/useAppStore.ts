import { UserMode, WatchlistItem } from "@/types";
import { create } from "zustand";

interface AppState {
  mode: UserMode;
  watchlist: WatchlistItem[];
  setMode: (mode: UserMode) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: "beginner",
  watchlist: [],
  setMode: (mode) => set({ mode }),
  addToWatchlist: (symbol) =>
    set((state) => ({
      watchlist: [
        ...state.watchlist,
        { symbol, addedAt: new Date().toISOString() },
      ],
    })),
  removeFromWatchlist: (symbol) =>
    set((state) => ({
      watchlist: state.watchlist.filter((item) => item.symbol !== symbol),
    })),
}));
