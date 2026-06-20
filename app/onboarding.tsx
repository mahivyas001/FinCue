// app/onboarding.tsx
// White CTA button, white dot indicator, white selected state — crypto clean

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ViewToken,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/fonts';

const { width } = Dimensions.get('window');

type Mode = 'beginner' | 'advanced';

const SLIDES = [
  {
    id: 'intro',
    tag: 'WELCOME TO FINCUE',
    headline: 'Your market,\nexplained.',
    body: "Real signals, plain language. No guesswork, no jargon — just clarity on what the market is doing and why.",
    visual: 'intro' as const,
  },
  {
    id: 'mode',
    tag: 'PICK YOUR STYLE',
    headline: 'How do you\ninvest?',
    body: "Choose how you want insights delivered. You can switch anytime in Settings.",
    visual: 'mode' as const,
  },
  {
    id: 'watchlist',
    tag: 'GET STARTED',
    headline: 'Add your\nfirst stock.',
    body: "Pick something you're watching. FinCue starts tracking signals for it right away.",
    visual: 'watchlist' as const,
  },
];

const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'NVDA', name: 'Nvidia' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
];

// ─── Intro Visual ─────────────────────────────────────────────────────────────

function IntroVisual() {
  return (
    <View style={styles.introWrapper}>
      <View style={styles.cardBack2} />
      <View style={styles.cardBack1} />
      <View style={styles.cardFront}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardSymbol}>AAPL</Text>
            <Text style={styles.cardCompany}>Apple Inc.</Text>
          </View>
          <View style={styles.bullishPill}>
            <View style={styles.bullishDot} />
            <Text style={styles.bullishText}>BULLISH</Text>
          </View>
        </View>
        <Text style={styles.cardQuote}>
          "Buyers are showing strong conviction. Momentum is building steadily."
        </Text>
        <View style={styles.cardStats}>
          {[
            { label: 'RSI', value: '68.4' },
            { label: 'Trend', value: 'Strong' },
            { label: 'Conf.', value: '82%' },
          ].map((item) => (
            <View key={item.label} style={styles.statBox}>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Mode Visual ──────────────────────────────────────────────────────────────

function ModeVisual({ selected, onSelect }: { selected: Mode; onSelect: (m: Mode) => void }) {
  return (
    <View style={styles.modeWrapper}>
      {[
        {
          id: 'beginner' as Mode,
          emoji: '🌱',
          title: 'Beginner',
          desc: 'Plain English explanations. No jargon. Guided context for every signal.',
          tags: ['Simple charts', 'Plain language', 'Guided tips'],
        },
        {
          id: 'advanced' as Mode,
          emoji: '⚡',
          title: 'Advanced',
          desc: 'Candlestick charts, raw RSI values, MACD, ADX — full technical breakdown.',
          tags: ['Candlestick', 'RSI / MACD', 'ADX strength'],
        },
      ].map((option) => {
        const active = selected === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.85}
            style={[
              styles.modeCard,
              active ? styles.modeCardActive : styles.modeCardInactive,
            ]}
          >
            <View style={styles.modeCardInner}>
              <Text style={styles.modeEmoji}>{option.emoji}</Text>
              <View style={styles.modeContent}>
                <View style={styles.modeTitleRow}>
                  <Text style={styles.modeTitle}>{option.title}</Text>
                  {/* WHITE checkmark when selected */}
                  <View style={[
                    styles.modeCheck,
                    active ? styles.modeCheckActive : styles.modeCheckInactive,
                  ]}>
                    {active && <Text style={styles.modeCheckMark}>✓</Text>}
                  </View>
                </View>
                <Text style={styles.modeDesc}>{option.desc}</Text>
                <View style={styles.modeTagRow}>
                  {option.tags.map((tag) => (
                    <View
                      key={tag}
                      style={[
                        styles.modeTag,
                        active ? styles.modeTagActive : styles.modeTagInactive,
                      ]}
                    >
                      <Text style={[
                        styles.modeTagText,
                        active ? styles.modeTagTextActive : styles.modeTagTextInactive,
                      ]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Watchlist Visual ─────────────────────────────────────────────────────────

function WatchlistVisual({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (symbol: string) => void;
}) {
  return (
    <View style={styles.watchlistWrapper}>
      <View style={styles.stockGrid}>
        {POPULAR_STOCKS.map((stock) => {
          const isSelected = selected.includes(stock.symbol);
          return (
            <TouchableOpacity
              key={stock.symbol}
              onPress={() => onToggle(stock.symbol)}
              activeOpacity={0.8}
              style={[
                styles.stockChip,
                isSelected ? styles.stockChipActive : styles.stockChipInactive,
              ]}
            >
              <Text style={[
                styles.stockSymbol,
                isSelected ? styles.stockSymbolActive : styles.stockSymbolInactive,
              ]}>
                {stock.symbol}
              </Text>
              <Text style={styles.stockName}>{stock.name}</Text>
              {isSelected && (
                <View style={styles.stockAdded}>
                  <Text style={styles.stockAddedText}>✓ added</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.watchlistHint}>
        {selected.length === 0
          ? 'Tap any stock to add it to your watchlist'
          : `${selected.length} stock${selected.length > 1 ? 's' : ''} added`}
      </Text>
    </View>
  );
}

// ─── Dot Indicator — WHITE ────────────────────────────────────────────────────

function DotIndicator({ count, active }: { count: number; active: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === active ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const { setMode, addToWatchlist, setHasOnboarded } = useAppStore();

  const [currentIndex, setCurrentIndex]   = useState(0);
  const [selectedMode, setSelectedMode]   = useState<Mode>('beginner');
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);

  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index ?? 0);
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  function goNext() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleFinish();
    }
  }

  function handleFinish() {
    setMode(selectedMode);
    selectedStocks.forEach((symbol) => addToWatchlist(symbol));
    setHasOnboarded(true);
    router.replace('/(tabs)/' as any);
  }

  function toggleStock(symbol: string) {
    setSelectedStocks((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  }

  const isLastSlide = currentIndex === SLIDES.length - 1;
  const canProceed  =
    currentIndex === 0 ||
    currentIndex === 1 ||
    (currentIndex === 2 && selectedStocks.length > 0);

  function ctaLabel() {
    if (currentIndex === 0) return 'Get Started →';
    if (currentIndex === 1)
      return `Continue as ${selectedMode === 'beginner' ? 'Beginner' : 'Advanced'} →`;
    if (selectedStocks.length > 0)
      return `Open FinCue with ${selectedStocks.length} stock${selectedStocks.length > 1 ? 's' : ''} →`;
    return 'Select at least one stock';
  }

  function renderSlide({ item }: { item: (typeof SLIDES)[0] }) {
    return (
      <View style={[styles.slide, { width }]}>
        {/* Tag pill — white bordered */}
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>{item.headline}</Text>

        {/* Body */}
        <Text style={styles.body}>{item.body}</Text>

        {/* Per-slide visual */}
        {item.visual === 'intro'     && <IntroVisual />}
        {item.visual === 'mode'      && <ModeVisual selected={selectedMode} onSelect={setSelectedMode} />}
        {item.visual === 'watchlist' && <WatchlistVisual selected={selectedStocks} onToggle={toggleStock} />}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Wordmark */}
      <View style={styles.wordmark}>
        <Text style={styles.wordmarkText}>
          Fin<Text style={styles.wordmarkAccent}>Cue</Text>
        </Text>
      </View>

      {/* Skip */}
      <TouchableOpacity onPress={handleFinish} activeOpacity={0.7} style={styles.skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={{ paddingTop: 88 }}
        style={{ flex: 1 }}
      />

      {/* Bottom bar */}
      <View style={styles.bottom}>
        <DotIndicator count={SLIDES.length} active={currentIndex} />

        {/* WHITE CTA button — black text */}
        <TouchableOpacity
          onPress={goNext}
          disabled={!canProceed}
          activeOpacity={0.88}
          style={[styles.cta, !canProceed && styles.ctaDisabled]}
        >
          <Text style={[styles.ctaText, !canProceed && styles.ctaTextDisabled]}>
            {ctaLabel()}
          </Text>
        </TouchableOpacity>

        {isLastSlide && (
          <Text style={styles.disclaimer}>
            FinCue provides analysis and education only. Not financial advice.
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: '#0A0A0A',
  },
  wordmark: {
    position: 'absolute',
    top:      56,
    left:     24,
    zIndex:   10,
  },
  wordmarkText: {
    fontFamily: FONTS.extraBold,
    fontSize:   FONT_SIZE.xl,
    color:      COLORS.white,
  },
  wordmarkAccent: {
    color: COLORS.white,
    opacity: 0.5,
  },
  skip: {
    position: 'absolute',
    top:      56,
    right:    24,
    zIndex:   10,
    padding:  8,
  },
  skipText: {
    fontFamily: FONTS.medium,
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textMuted,
  },

  // ── Slide ──────────────────────────────────────
  slide: {
    flex:             1,
    paddingHorizontal: 24,
    paddingTop:       8,
  },
  tagPill: {
    alignSelf:        'flex-start',
    borderWidth:      1,
    borderColor:      'rgba(255,255,255,0.2)',
    borderRadius:     100,
    paddingHorizontal: 12,
    paddingVertical:  5,
    marginBottom:     20,
  },
  tagText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONT_SIZE.xs,
    color:         'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
  headline: {
    fontFamily:    FONTS.extraBold,
    fontSize:      FONT_SIZE['3xl'],
    color:         COLORS.white,
    lineHeight:    44,
    marginBottom:  12,
  },
  body: {
    fontFamily:   FONTS.regular,
    fontSize:     FONT_SIZE.base,
    color:        COLORS.textSub,
    lineHeight:   26,
    marginBottom: 16,
  },

  // ── Intro card ─────────────────────────────────
  introWrapper: {
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 24,
  },
  cardBack2: {
    position:        'absolute',
    width:           280,
    height:          160,
    borderRadius:    20,
    backgroundColor: '#111111',
    borderWidth:     1,
    borderColor:     '#222222',
    transform:       [{ rotate: '-5deg' }, { translateY: 10 }],
  },
  cardBack1: {
    position:        'absolute',
    width:           280,
    height:          160,
    borderRadius:    20,
    backgroundColor: '#161616',
    borderWidth:     1,
    borderColor:     '#222222',
    transform:       [{ rotate: '2.5deg' }, { translateY: 5 }],
  },
  cardFront: {
    width:           280,
    borderRadius:    20,
    backgroundColor: '#1A1A1A',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.1)',
    padding:         16,
    gap:             10,
  },
  cardHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  cardSymbol: {
    fontFamily: FONTS.extraBold,
    fontSize:   FONT_SIZE.lg,
    color:      COLORS.white,
  },
  cardCompany: {
    fontFamily: FONTS.regular,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textMuted,
  },
  bullishPill: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              6,
    backgroundColor:  'rgba(162,224,252,0.10)',
    borderWidth:      1,
    borderColor:      'rgba(162,224,252,0.25)',
    borderRadius:     100,
    paddingHorizontal: 10,
    paddingVertical:  4,
  },
  bullishDot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: COLORS.bullish,
  },
  bullishText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONT_SIZE.xs,
    color:         COLORS.bullish,
    letterSpacing: 1,
  },
  cardQuote: {
    fontFamily: FONTS.regular,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textSub,
    lineHeight: 18,
  },
  cardStats: {
    flexDirection: 'row',
    gap:           8,
  },
  statBox: {
    flex:            1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius:    10,
    padding:         8,
    gap:             2,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize:   10,
    color:      COLORS.textMuted,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.white,
  },

  // ── Mode cards ─────────────────────────────────
  modeWrapper: {
    gap:          12,
    paddingTop:   8,
  },
  modeCard: {
    borderRadius: 18,
    borderWidth:  1,
    padding:      16,
  },
  modeCardActive: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor:     'rgba(255,255,255,0.25)',
  },
  modeCardInactive: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor:     'rgba(255,255,255,0.07)',
  },
  modeCardInner: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           12,
  },
  modeEmoji: {
    fontSize:  22,
    marginTop: 2,
  },
  modeContent: {
    flex: 1,
    gap:  6,
  },
  modeTitleRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  modeTitle: {
    fontFamily: FONTS.bold,
    fontSize:   FONT_SIZE.base,
    color:      COLORS.white,
  },
  modeCheck: {
    width:        20,
    height:       20,
    borderRadius: 10,
    borderWidth:  2,
    alignItems:   'center',
    justifyContent: 'center',
  },
  modeCheckActive: {
    backgroundColor: COLORS.white,   // white fill when selected
    borderColor:     COLORS.white,
  },
  modeCheckInactive: {
    backgroundColor: 'transparent',
    borderColor:     'rgba(255,255,255,0.2)',
  },
  modeCheckMark: {
    fontFamily: FONTS.bold,
    fontSize:   11,
    color:      '#0A0A0A',           // black tick on white circle
  },
  modeDesc: {
    fontFamily: FONTS.regular,
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textSub,
    lineHeight: 20,
  },
  modeTagRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
    marginTop:     2,
  },
  modeTag: {
    borderRadius:     100,
    paddingHorizontal: 10,
    paddingVertical:  3,
    borderWidth:      1,
  },
  modeTagActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor:     'rgba(255,255,255,0.2)',
  },
  modeTagInactive: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor:     'rgba(255,255,255,0.07)',
  },
  modeTagText: {
    fontFamily: FONTS.medium,
    fontSize:   FONT_SIZE.xs,
  },
  modeTagTextActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  modeTagTextInactive: {
    color: COLORS.textMuted,
  },

  // ── Watchlist ──────────────────────────────────
  watchlistWrapper: {
    paddingTop: 8,
    gap:        12,
  },
  stockGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           10,
    justifyContent: 'center',
  },
  stockChip: {
    borderRadius:     14,
    borderWidth:      1,
    paddingHorizontal: 16,
    paddingVertical:  12,
    minWidth:         100,
    alignItems:       'center',
    gap:              3,
  },
  stockChipActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor:     'rgba(255,255,255,0.3)',
  },
  stockChipInactive: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor:     'rgba(255,255,255,0.08)',
  },
  stockSymbol: {
    fontFamily:    FONTS.bold,
    fontSize:      FONT_SIZE.sm,
    letterSpacing: 0.5,
  },
  stockSymbolActive: {
    color: COLORS.white,
  },
  stockSymbolInactive: {
    color: 'rgba(255,255,255,0.6)',
  },
  stockName: {
    fontFamily: FONTS.regular,
    fontSize:   10,
    color:      COLORS.textMuted,
  },
  stockAdded: {
    marginTop:        2,
    backgroundColor:  'rgba(255,255,255,0.1)',
    borderRadius:     100,
    paddingHorizontal: 8,
    paddingVertical:  2,
  },
  stockAddedText: {
    fontFamily: FONTS.semiBold,
    fontSize:   10,
    color:      COLORS.white,
  },
  watchlistHint: {
    fontFamily: FONTS.regular,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textMuted,
    textAlign:  'center',
  },

  // ── Dot indicator — WHITE ──────────────────────
  dots: {
    flexDirection:  'row',
    gap:            8,
    alignItems:     'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 100,
  },
  dotActive: {
    width:           24,
    height:          6,
    backgroundColor: COLORS.white,   // white active dot
  },
  dotInactive: {
    width:           6,
    height:          6,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // ── Bottom ─────────────────────────────────────
  bottom: {
    paddingHorizontal: 24,
    paddingBottom:     48,
    paddingTop:        16,
    gap:               14,
  },

  // WHITE button — black text
  cta: {
    backgroundColor: COLORS.white,
    borderRadius:    16,
    paddingVertical: 18,
    alignItems:      'center',
  },
  ctaDisabled: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  ctaText: {
    fontFamily:    FONTS.bold,
    fontSize:      FONT_SIZE.base,
    color:         '#0A0A0A',        // black text on white button
    letterSpacing: 0.3,
  },
  ctaTextDisabled: {
    color: 'rgba(255,255,255,0.25)',
  },
  disclaimer: {
    fontFamily: FONTS.regular,
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textMuted,
    textAlign:  'center',
    lineHeight: 18,
  },
});