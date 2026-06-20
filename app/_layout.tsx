// app/_layout.tsx
// Loads Space Grotesk before rendering anything
// Run first: npx expo install @expo-google-fonts/space-grotesk expo-font

import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import {
  useFonts,
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import '@/global.css';

function OnboardingGate() {
  const router   = useRouter();
  const segments = useSegments();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  useEffect(() => {
    const firstSegment = segments[0] as string | undefined;
    const inOnboarding = firstSegment === 'onboarding';

    if (!hasOnboarded && !inOnboarding) {
      router.replace('/onboarding' as any);
    }
    if (hasOnboarded && inOnboarding) {
      router.replace('/(tabs)/' as any);
    }
  }, [hasOnboarded, segments]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  // Hold render until fonts are ready — prevents flash of system font
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} />;
  }

  return (
    <>
      <OnboardingGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="stock/[symbol]" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}