// app/_layout.tsx

import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import '@/global.css';

function OnboardingGate() {
  const router = useRouter();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  useEffect(() => {
    if (!hasOnboarded) {
      const timer = setTimeout(() => {
        router.replace('/onboarding');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [hasOnboarded]);

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