// app/onboarding.tsx
// FinCue Onboarding — 3 slides
// Crypto-dark aesthetic: deep blacks, neon indigo accents, glassy cards

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ViewToken,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

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
    <View className="items-center justify-center py-6">
      {/* Glow behind card */}
      <View
        className="absolute w-48 h-48 rounded-full bg-[#4F46E5]/20"
        style={{ top: 10, alignSelf: 'center' }}
      />
      {/* Stacked cards */}
      <View className="relative w-72 h-44">
        <View
          className="absolute inset-0 rounded-2xl bg-[#0F1629] border border-[#4F46E5]/20"
          style={{ transform: [{ rotate: '-5deg' }, { translateY: 10 }] }}
        />
        <View
          className="absolute inset-0 rounded-2xl bg-[#111827] border border-[#4F46E5]/40"
          style={{ transform: [{ rotate: '2.5deg' }, { translateY: 5 }] }}
        />
        {/* Main card */}
        <View className="absolute inset-0 rounded-2xl border border-[#4F46E5]/70 overflow-hidden">
          {/* Subtle gradient top */}
          <View className="absolute inset-x-0 top-0 h-16 bg-[#4F46E5]/8" />
          <View className="p-4 flex-1">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-white font-bold text-lg tracking-wide">AAPL</Text>
                <Text className="text-slate-500 text-xs">Apple Inc.</Text>
              </View>
              <View className="flex-row items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3 py-1">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <Text className="text-emerald-400 text-xs font-bold tracking-wider">BULLISH</Text>
              </View>
            </View>
            <Text className="text-slate-400 text-xs leading-4 mb-3">
              "Buyers are showing strong conviction. Momentum is building steadily."
            </Text>
            <View className="flex-row gap-2">
              {[
                { label: 'RSI', value: '68.4', color: 'text-emerald-400' },
                { label: 'Trend', value: 'Strong', color: 'text-emerald-400' },
                { label: 'Conf.', value: '82%', color: 'text-[#818CF8]' },
              ].map((item) => (
                <View key={item.label} className="flex-1 bg-white/5 rounded-xl p-2 border border-white/5">
                  <Text className="text-slate-500 text-xs mb-0.5">{item.label}</Text>
                  <Text className={`${item.color} text-sm font-bold`}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Mode Visual ─────────────────────────────────────────────────────────────

function ModeVisual({ selected, onSelect }: { selected: Mode; onSelect: (m: Mode) => void }) {
  return (
    <View className="w-full gap-3 py-2">
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
          >
            <View
              className={`rounded-2xl border p-4 ${
                active
                  ? 'bg-[#4F46E5]/12 border-[#4F46E5]'
                  : 'bg-white/4 border-white/8'
              }`}
            >
              <View className="flex-row items-start gap-3">
                <Text className="text-2xl mt-0.5">{option.emoji}</Text>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-white font-bold text-base">{option.title}</Text>
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                        active ? 'bg-[#4F46E5] border-[#4F46E5]' : 'border-slate-600'
                      }`}
                    >
                      {active && <Text className="text-white text-xs">✓</Text>}
                    </View>
                  </View>
                  <Text className="text-slate-400 text-sm leading-5 mb-2">{option.desc}</Text>
                  <View className="flex-row gap-1.5 flex-wrap">
                    {option.tags.map((tag) => (
                      <View
                        key={tag}
                        className={`rounded-full px-2 py-0.5 border ${
                          active
                            ? 'bg-[#4F46E5]/15 border-[#4F46E5]/40'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <Text
                          className={`text-xs ${active ? 'text-[#818CF8]' : 'text-slate-400'}`}
                        >
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
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
    <View className="w-full py-3">
      <View className="flex-row flex-wrap gap-2 justify-center">
        {POPULAR_STOCKS.map((stock) => {
          const isSelected = selected.includes(stock.symbol);
          return (
            <TouchableOpacity
              key={stock.symbol}
              onPress={() => onToggle(stock.symbol)}
              activeOpacity={0.8}
            >
              <View
                className={`rounded-xl border px-4 py-3 min-w-[100px] items-center ${
                  isSelected
                    ? 'bg-[#4F46E5]/20 border-[#4F46E5]'
                    : 'bg-white/4 border-white/10'
                }`}
              >
                <Text
                  className={`font-bold text-sm tracking-wide ${
                    isSelected ? 'text-[#818CF8]' : 'text-white'
                  }`}
                >
                  {stock.symbol}
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">{stock.name}</Text>
                {isSelected && (
                  <View className="mt-1.5 bg-[#4F46E5]/30 rounded-full px-2 py-0.5">
                    <Text className="text-[#818CF8] text-xs">✓ added</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text className="text-slate-600 text-xs text-center mt-4">
        {selected.length === 0
          ? 'Tap any stock to add it to your watchlist'
          : `${selected.length} stock${selected.length > 1 ? 's' : ''} added`}
      </Text>
    </View>
  );
}

// ─── Dot Indicator ────────────────────────────────────────────────────────────

function DotIndicator({ count, active }: { count: number; active: number }) {
  return (
    <View className="flex-row gap-2 items-center justify-center">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className={`rounded-full ${
            i === active ? 'w-6 h-2 bg-[#4F46E5]' : 'w-2 h-2 bg-slate-700'
          }`}
        />
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const { setMode, addToWatchlist, setHasOnboarded } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<Mode>('beginner');
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);

  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
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
  const canProceed =
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
      <View style={{ width }} className="flex-1 px-6 pt-2">
        {/* Tag pill */}
        <View className="self-start bg-[#4F46E5]/15 border border-[#4F46E5]/40 rounded-full px-3 py-1 mb-5">
          <Text className="text-[#818CF8] text-xs font-bold tracking-widest">{item.tag}</Text>
        </View>

        {/* Headline */}
        <Text className="text-white text-4xl font-bold leading-tight mb-3">
          {item.headline}
        </Text>

        {/* Body */}
        <Text className="text-slate-400 text-base leading-6 mb-4">{item.body}</Text>

        {/* Per-slide visual */}
        {item.visual === 'intro' && <IntroVisual />}
        {item.visual === 'mode' && (
          <ModeVisual selected={selectedMode} onSelect={setSelectedMode} />
        )}
        {item.visual === 'watchlist' && (
          <WatchlistVisual selected={selectedStocks} onToggle={toggleStock} />
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#080D17]">
      <StatusBar barStyle="light-content" />

      {/* Ambient glow — top left */}
      <View
        className="absolute w-72 h-72 rounded-full bg-[#4F46E5]/10"
        style={{ top: -80, left: -80 }}
        pointerEvents="none"
      />

      {/* Wordmark */}
      <View className="absolute top-14 left-6 z-10">
        <Text className="text-white font-bold text-xl tracking-tight">
          Fin<Text className="text-[#4F46E5]">Cue</Text>
        </Text>
      </View>

      {/* Skip */}
      <TouchableOpacity
        onPress={handleFinish}
        activeOpacity={0.7}
        className="absolute top-14 right-6 z-10 py-2 px-3"
      >
        <Text className="text-slate-600 text-sm">Skip</Text>
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
        className="flex-1"
      />

      {/* Bottom bar */}
      <View className="px-6 pb-12 pt-4 gap-4">
        <DotIndicator count={SLIDES.length} active={currentIndex} />

        <TouchableOpacity
          onPress={goNext}
          disabled={!canProceed}
          activeOpacity={0.85}
          className={`rounded-2xl py-4 items-center border ${
            canProceed
              ? 'bg-[#4F46E5] border-[#4F46E5]'
              : 'bg-[#4F46E5]/20 border-[#4F46E5]/30'
          }`}
        >
          <Text
            className={`font-bold text-base ${canProceed ? 'text-white' : 'text-[#4F46E5]/60'}`}
          >
            {ctaLabel()}
          </Text>
        </TouchableOpacity>

        {isLastSlide && (
          <Text className="text-slate-700 text-xs text-center leading-4">
            FinCue provides analysis and education only. Not financial advice.
          </Text>
        )}
      </View>
    </View>
  );
}