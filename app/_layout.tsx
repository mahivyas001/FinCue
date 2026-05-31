// app/_layout.tsx

import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import '@/global.css';

SplashScreen.preventAutoHideAsync();

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
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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