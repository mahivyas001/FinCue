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

function IntroVisual() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
      <View style={{
        width: 288, height: 176,
        position: 'relative',
      }}>
        <View style={{
          position: 'absolute', inset: 0,
          borderRadius: 20,
          backgroundColor: '#0D0D14',
          borderWidth: 1,
          borderColor: 'rgba(147,197,253,0.08)',
          transform: [{ rotate: '-4deg' }, { translateY: 10 }],
        }} />
        <View style={{
          position: 'absolute', inset: 0,
          borderRadius: 20,
          backgroundColor: '#111117',
          borderWidth: 1,
          borderColor: 'rgba(147,197,253,0.15)',
          transform: [{ rotate: '2deg' }, { translateY: 4 }],
        }} />
        <View style={{
          position: 'absolute', inset: 0,
          borderRadius: 20,
          backgroundColor: '#111117',
          borderWidth: 1,
          borderColor: 'rgba(147,197,253,0.25)',
          overflow: 'hidden',
          padding: 16,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18, letterSpacing: 1 }}>AAPL</Text>
              <Text style={{ color: '#374151', fontSize: 11 }}>Apple Inc.</Text>
            </View>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: 'rgba(147,197,253,0.10)',
              borderWidth: 1, borderColor: 'rgba(147,197,253,0.25)',
              borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4,
            }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#93C5FD' }} />
              <Text style={{ color: '#93C5FD', fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>BULLISH</Text>
            </View>
          </View>
          <Text style={{ color: '#6B7280', fontSize: 11, lineHeight: 16, marginBottom: 12 }}>
            "Buyers are showing strong conviction. Momentum building."
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { label: 'RSI', value: '68.4', color: '#93C5FD' },
              { label: 'Trend', value: 'Strong', color: '#93C5FD' },
              { label: 'Conf.', value: '82%', color: '#FDA4AF' },
            ].map((item) => (
              <View key={item.label} style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 12, padding: 8,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
              }}>
                <Text style={{ color: '#374151', fontSize: 10, marginBottom: 2 }}>{item.label}</Text>
                <Text style={{ color: item.color, fontSize: 13, fontWeight: '700' }}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function ModeVisual({ selected, onSelect }: { selected: Mode; onSelect: (m: Mode) => void }) {
  return (
    <View style={{ width: '100%', gap: 12, paddingVertical: 8 }}>
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
          <TouchableOpacity key={option.id} onPress={() => onSelect(option.id)} activeOpacity={0.85}>
            <View style={{
              borderRadius: 20, padding: 16,
              backgroundColor: active ? 'rgba(147,197,253,0.06)' : 'rgba(255,255,255,0.02)',
              borderWidth: 1,
              borderColor: active ? 'rgba(147,197,253,0.35)' : 'rgba(255,255,255,0.06)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <Text style={{ fontSize: 22, marginTop: 2 }}>{option.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>{option.title}</Text>
                    <View style={{
                      width: 20, height: 20, borderRadius: 10,
                      borderWidth: 2,
                      borderColor: active ? '#93C5FD' : '#374151',
                      backgroundColor: active ? '#93C5FD' : 'transparent',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {active && <Text style={{ color: '#09090F', fontSize: 11, fontWeight: '700' }}>✓</Text>}
                    </View>
                  </View>
                  <Text style={{ color: '#6B7280', fontSize: 13, lineHeight: 18, marginBottom: 10 }}>{option.desc}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    {option.tags.map((tag) => (
                      <View key={tag} style={{
                        borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3,
                        backgroundColor: active ? 'rgba(147,197,253,0.10)' : 'rgba(255,255,255,0.04)',
                        borderWidth: 1,
                        borderColor: active ? 'rgba(147,197,253,0.30)' : 'rgba(255,255,255,0.08)',
                      }}>
                        <Text style={{ fontSize: 11, color: active ? '#93C5FD' : '#6B7280' }}>{tag}</Text>
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

function WatchlistVisual({ selected, onToggle }: { selected: string[]; onToggle: (s: string) => void }) {
  return (
    <View style={{ width: '100%', paddingVertical: 12 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {POPULAR_STOCKS.map((stock) => {
          const isSelected = selected.includes(stock.symbol);
          return (
            <TouchableOpacity key={stock.symbol} onPress={() => onToggle(stock.symbol)} activeOpacity={0.8}>
              <View style={{
                borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
                minWidth: 100, alignItems: 'center',
                backgroundColor: isSelected ? 'rgba(147,197,253,0.08)' : 'rgba(255,255,255,0.02)',
                borderWidth: 1,
                borderColor: isSelected ? 'rgba(147,197,253,0.40)' : 'rgba(255,255,255,0.06)',
              }}>
                <Text style={{
                  fontWeight: '700', fontSize: 13, letterSpacing: 0.5,
                  color: isSelected ? '#93C5FD' : '#FFFFFF',
                }}>{stock.symbol}</Text>
                <Text style={{ color: '#374151', fontSize: 11, marginTop: 2 }}>{stock.name}</Text>
                {isSelected && (
                  <View style={{
                    marginTop: 6, backgroundColor: 'rgba(147,197,253,0.15)',
                    borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2,
                  }}>
                    <Text style={{ color: '#93C5FD', fontSize: 10 }}>✓ added</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={{ color: '#374151', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
        {selected.length === 0
          ? 'Tap any stock to add it to your watchlist'
          : `${selected.length} stock${selected.length > 1 ? 's' : ''} added`}
      </Text>
    </View>
  );
}

function DotIndicator({ count, active }: { count: number; active: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{
          borderRadius: 100,
          width: i === active ? 24 : 6,
          height: 6,
          backgroundColor: i === active ? '#93C5FD' : '#1F2937',
        }} />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { setMode, addToWatchlist, setHasOnboarded } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<Mode>('beginner');
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

  const canProceed =
    currentIndex === 0 ||
    currentIndex === 1 ||
    (currentIndex === 2 && selectedStocks.length > 0);

  function ctaLabel() {
    if (currentIndex === 0) return 'Get Started →';
    if (currentIndex === 1) return `Continue as ${selectedMode === 'beginner' ? 'Beginner' : 'Advanced'} →`;
    if (selectedStocks.length > 0) return `Open FinCue with ${selectedStocks.length} stock${selectedStocks.length > 1 ? 's' : ''} →`;
    return 'Select at least one stock';
  }

  function renderSlide({ item }: { item: typeof SLIDES[0] }) {
    return (
      <View style={{ width, flex: 1, paddingHorizontal: 24, paddingTop: 8 }}>
        <View style={{
          alignSelf: 'flex-start',
          backgroundColor: 'rgba(147,197,253,0.08)',
          borderWidth: 1, borderColor: 'rgba(147,197,253,0.20)',
          borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 20,
        }}>
          <Text style={{ color: '#93C5FD', fontSize: 10, fontWeight: '700', letterSpacing: 2 }}>{item.tag}</Text>
        </View>
        <Text style={{ color: '#FFFFFF', fontSize: 38, fontWeight: '700', lineHeight: 44, marginBottom: 12 }}>
          {item.headline}
        </Text>
        <Text style={{ color: '#6B7280', fontSize: 15, lineHeight: 22, marginBottom: 16 }}>{item.body}</Text>
        {item.visual === 'intro' && <IntroVisual />}
        {item.visual === 'mode' && <ModeVisual selected={selectedMode} onSelect={setSelectedMode} />}
        {item.visual === 'watchlist' && <WatchlistVisual selected={selectedStocks} onToggle={toggleStock} />}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#09090F' }}>
      <StatusBar barStyle="light-content" />

      {/* Ambient glow */}
      <View style={{
        position: 'absolute', width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(147,197,253,0.04)', top: -100, left: -100,
      }} pointerEvents="none" />
      <View style={{
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(253,164,175,0.04)', bottom: 100, right: -60,
      }} pointerEvents="none" />

      {/* Wordmark */}
      <View style={{ position: 'absolute', top: 56, left: 24, zIndex: 10 }}>
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 20, letterSpacing: -0.5 }}>
          Fin<Text style={{ color: '#93C5FD' }}>Cue</Text>
        </Text>
      </View>

      {/* Skip */}
      <TouchableOpacity
        onPress={handleFinish}
        style={{ position: 'absolute', top: 56, right: 24, zIndex: 10, paddingHorizontal: 12, paddingVertical: 8 }}
      >
        <Text style={{ color: '#374151', fontSize: 13 }}>Skip</Text>
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
      <View style={{ paddingHorizontal: 24, paddingBottom: 48, paddingTop: 16, gap: 16 }}>
        <DotIndicator count={SLIDES.length} active={currentIndex} />
        <TouchableOpacity
          onPress={goNext}
          disabled={!canProceed}
          activeOpacity={0.85}
          style={{
            borderRadius: 16, paddingVertical: 16, alignItems: 'center',
            backgroundColor: canProceed ? '#93C5FD' : 'rgba(147,197,253,0.12)',
            borderWidth: 1,
            borderColor: canProceed ? '#93C5FD' : 'rgba(147,197,253,0.20)',
          }}
        >
          <Text style={{
            fontWeight: '700', fontSize: 15,
            color: canProceed ? '#09090F' : 'rgba(147,197,253,0.40)',
          }}>
            {ctaLabel()}
          </Text>
        </TouchableOpacity>
        {currentIndex === SLIDES.length - 1 && (
          <Text style={{ color: '#1F2937', fontSize: 11, textAlign: 'center', lineHeight: 16 }}>
            FinCue provides analysis and education only. Not financial advice.
          </Text>
        )}
      </View>
    </View>
  );
}