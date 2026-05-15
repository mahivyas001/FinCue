import { create } from "zustand";
import { UserMode, WatchlistItem, MarketType } from "@/types";

type MarketFilter = "ALL" | MarketType;

interface AppState {
  mode: UserMode;
  watchlist: WatchlistItem[];
  marketFilter: MarketFilter;
  setMode: (mode: UserMode) => void;
  setMarketFilter: (filter: MarketFilter) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: "beginner",
  watchlist: [],
  marketFilter: "ALL",
  setMode: (mode) => set({ mode }),
  setMarketFilter: (filter) => set({ marketFilter: filter }),
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