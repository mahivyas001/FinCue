import { create } from "zustand";
import { UserMode, WatchlistItem, MarketType } from "@/types/stock";

type MarketFilter = "ALL" | MarketType;
type Theme = "dark" | "light";

interface AppState {
  mode:                 UserMode;
  theme:                Theme;
  watchlist:            WatchlistItem[];
  marketFilter:         MarketFilter;
  setMode:              (mode: UserMode) => void;
  setTheme:             (theme: Theme) => void;
  toggleTheme:          () => void;
  setMarketFilter:      (filter: MarketFilter) => void;
  addToWatchlist:       (symbol: string) => void;
  removeFromWatchlist:  (symbol: string) => void;
  // ✅ Convenience method — toggles add/remove in one call
  //    Prevents StockCard (and any other component) from
  //    needing to read watchlist state just to decide which action to call
  toggleWatchlist:      (symbol: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  mode:         "beginner",
  theme:        "dark",
  watchlist:    [],
  marketFilter: "ALL",

  setMode:         (mode)   => set({ mode }),
  setTheme:        (theme)  => set({ theme }),
  toggleTheme:     ()       => set((state) => ({
    theme: state.theme === "dark" ? "light" : "dark",
  })),
  setMarketFilter: (filter) => set({ marketFilter: filter }),

  addToWatchlist: (symbol) =>
    set((state) => {
      // Guard: don't add duplicates
      if (state.watchlist.some((item) => item.symbol === symbol)) return state;
      return {
        watchlist: [
          ...state.watchlist,
          { symbol, addedAt: new Date().toISOString() },
        ],
      };
    }),

  removeFromWatchlist: (symbol) =>
    set((state) => ({
      watchlist: state.watchlist.filter((item) => item.symbol !== symbol),
    })),

  // ✅ toggleWatchlist — calls add or remove based on current state
  //    Uses get() so it reads latest state without a new subscription
  toggleWatchlist: (symbol) => {
    const { watchlist, addToWatchlist, removeFromWatchlist } = get();
    const isSaved = watchlist.some((item) => item.symbol === symbol);
    if (isSaved) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  },
}));