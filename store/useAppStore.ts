import { create } from "zustand";
import { UserMode, WatchlistItem, MarketType } from "@/types/stock";

type MarketFilter = "ALL" | MarketType;
type Theme = "dark" | "light";

interface AppState {
  mode: UserMode;
  theme: Theme;
  watchlist: WatchlistItem[];
  marketFilter: MarketFilter;
  setMode: (mode: UserMode) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setMarketFilter: (filter: MarketFilter) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: "beginner",
  theme: "dark",
  watchlist: [],
  marketFilter: "ALL",
  setMode: (mode) => set({ mode }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
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