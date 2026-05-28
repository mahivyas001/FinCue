// app/_layout.tsx

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import '@/global.css';

function OnboardingGate() {
  const router = useRouter();
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