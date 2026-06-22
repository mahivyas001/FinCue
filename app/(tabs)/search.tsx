import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/fonts';
import { MOCK_STOCKS } from '@/constants/mockData';
import { Stock } from '@/types/stock';
import SearchBar from '@/components/ui/SearchBar';
import StockCard from '@/components/stock/StockCard';
import { searchSymbols, SearchedSymbol } from '@/lib/api/symbols';

// ── Popular fallback — first 4 curated mock stocks ────────────────────────
const POPULAR = MOCK_STOCKS.slice(0, 4);

export default function SearchScreen() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<SearchedSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Watchlist from store — used to populate the pre-search state
  const watchlist = useAppStore(s => s.watchlist);
  const watchlistStocks: Stock[] = watchlist
    .map(sym => MOCK_STOCKS.find(s => s.symbol === sym))
    .filter(Boolean) as Stock[];

  // ── Debounced search — logic unchanged ────────────────────────────────
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await searchSymbols(query);
        setResults(data);
      } catch (err) {
        console.error('[SearchScreen] search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  // ── Map API results → Stock shape for StockCard ───────────────────────
  const mappedResults: Stock[] = results.map(item => {
    const isIndian = item.symbol.endsWith('.BSE') || item.symbol.endsWith('.NS');
    const s: Stock = {
      symbol:        item.symbol,
      name:          item.name,
      price:         0,
      change:        0,
      changePercent: 0,
      signal:        'neutral',
      confidence:    50,
      market:        isIndian ? 'IN' : 'US',
    };
    (s as any).type = item.type;
    return s;
  });

  // ── Pre-search content ─────────────────────────────────────────────────
  const hasWatchlist   = watchlistStocks.length > 0;
  const preSearchLabel = hasWatchlist ? 'YOUR WATCHLIST' : 'POPULAR STOCKS';
  const preSearchCount = hasWatchlist ? watchlistStocks.length : POPULAR.length;
  const preSearchStocks: Stock[] = hasWatchlist ? watchlistStocks : POPULAR;
  const isPreSearch = query.trim().length < 2;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <Text style={styles.subtitle}>Find any stock by symbol or name.</Text>
        </View>

        {/* ── Search bar ── */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => { setQuery(''); setResults([]); }}
          placeholder="e.g. AAPL, Reliance, VOD.L…"
        />

        {/* ── Content area ── */}
        <View style={styles.body}>

          {/* ── Pre-search: watchlist or popular ── */}
          {isPreSearch && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>{preSearchLabel}</Text>
                <Text style={styles.sectionCount}>{preSearchCount} stocks</Text>
              </View>
              <View style={styles.cardList}>
                {preSearchStocks.map(stock => (
                  <StockCard key={stock.symbol} stock={stock} />
                ))}
              </View>
            </View>
          )}

          {/* ── Loading ── */}
          {!isPreSearch && isLoading && (
            <View style={styles.centred}>
              <ActivityIndicator size="large" color={COLORS.bullish} />
              <Text style={styles.centredText}>Searching…</Text>
            </View>
          )}

          {/* ── No results ── */}
          {!isPreSearch && !isLoading && results.length === 0 && (
            <View style={styles.centred}>
              <Text style={styles.noResultsEmoji}>😕</Text>
              <Text style={styles.noResultsTitle}>No results found</Text>
              <Text style={styles.noResultsSub}>
                Try AAPL, TSLA, INFY or a full symbol like VOD.L
              </Text>
            </View>
          )}

          {/* ── Results ── */}
          {!isPreSearch && !isLoading && results.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>RESULTS</Text>
                <Text style={styles.sectionCount}>
                  {results.length} for "{query}"
                </Text>
              </View>
              <View style={styles.cardList}>
                {mappedResults.map(stock => (
                  <StockCard key={stock.symbol} stock={stock} />
                ))}
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: COLORS.appBg.base,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop:        60,
    paddingBottom:     40,
    gap:               20,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    gap: 2,
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize:   FONT_SIZE['2xl'],
    color:      COLORS.textPrimary.primary,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textMuted,        // #4B5563 — matches Home's greeting line
  },

  // ── Body ────────────────────────────────────────────────────────────────
  body: {
    gap: 4,
  },

  // ── Section header — identical to Home's "MARKETS" / "AI RADAR" ────────
  section: {
    gap: 12,
  },
  sectionRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily:    FONTS.bold,
    fontSize:      FONT_SIZE.xs,   // 13 — same as Home sectionLabel
    color:         COLORS.textMuted,
    letterSpacing: 2,
  },
  sectionCount: {
    fontFamily: FONTS.medium,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textMuted,
  },
  cardList: {
    gap: 2,
  },

  // ── Centred states (loading / no-results) ───────────────────────────────
  centred: {
    alignItems:    'center',
    paddingTop:    40,
    paddingBottom: 24,
    gap:           10,
  },
  centredText: {
    fontFamily: FONTS.medium,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textPrimary.muted,
    marginTop:  4,
  },
  noResultsEmoji: {
    fontSize:    36,
    lineHeight:  44,
  },
  noResultsTitle: {
    fontFamily: FONTS.bold,
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textPrimary.primary,
  },
  noResultsSub: {
    fontFamily: FONTS.regular,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textPrimary.muted,
    textAlign:  'center',
    lineHeight: 18,
  },
});
