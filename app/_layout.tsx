// app/_layout.tsx
// Loads Space Grotesk before rendering anything

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
import Constants from 'expo-constants';
import { usePushToken } from '@/hooks/usePushToken';
import { useAlertSync } from '@/hooks/useAlertSync';
import '@/global.css';

// expo-notifications remote push is unavailable in Expo Go SDK 53+.
// All notification wiring is skipped in that environment.
const isExpoGo = Constants.appOwnership === 'expo';

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

  // Run notification hooks globally
  usePushToken();
  useAlertSync();

  const router = useRouter();

  useEffect(() => {
    if (isExpoGo) return; // Push notifications unavailable in Expo Go SDK 53+

    let sub: { remove(): void } | null = null;

    import('expo-notifications').then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      sub = Notifications.addNotificationResponseReceivedListener((response) => {
        const symbol = response.notification.request.content.data?.symbol;
        if (symbol) {
          console.log(`[Notification Tap] Navigating to stock: ${symbol}`);
          router.push(`/stock/${symbol}` as any);
        }
      });
    }).catch((err) => {
      console.warn('[RootLayout] expo-notifications load failed:', err);
    });

    return () => {
      sub?.remove();
    };
  }, [router]);

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
        <Stack.Screen name="alerts" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}