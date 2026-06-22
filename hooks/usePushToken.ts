// hooks/usePushToken.ts

import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAppStore } from '@/store/useAppStore';

/**
 * Returns true if the app is running inside Expo Go.
 * expo-notifications remote push is unavailable in Expo Go SDK 53+.
 * All push token logic must be skipped in this environment.
 */
function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Helper to request notification permissions and retrieve the push token.
 * Returns true if permissions were granted, false otherwise.
 * Safe to call from Settings even in Expo Go — it will warn but not crash.
 */
export async function requestPushTokenPermission(
  setPushToken: (token: string | null) => void
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  if (isExpoGo()) {
    console.warn(
      '[usePushToken] Running in Expo Go — remote push notifications are not supported. ' +
      'Use a development build or physical device with EAS to test push delivery.'
    );
    return false;
  }

  try {
    const Notifications = await import('expo-notifications');

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      setPushToken(null);
      return false;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const token = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;

    console.log('[usePushToken] Push token successfully retrieved:', token);
    setPushToken(token);
    return true;
  } catch (error) {
    console.warn('[usePushToken] Error requesting push token:', error);
    setPushToken(null);
    return false;
  }
}

/**
 * Hook to run on app launch. Silently skips in Expo Go.
 * On a development build or production app, fetches the push token
 * if permissions have already been granted — doesn't prompt on launch.
 */
export function usePushToken() {
  const setPushToken = useAppStore((s) => s.setPushToken);

  useEffect(() => {
    if (isExpoGo() || Platform.OS === 'web') {
      return;
    }

    let isMounted = true;

    async function checkExistingPermission() {
      try {
        const Notifications = await import('expo-notifications');
        const { status } = await Notifications.getPermissionsAsync();

        if (status === 'granted') {
          const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId;
          const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
          if (isMounted) setPushToken(token);
        } else {
          // Not granted — don't auto-prompt on launch; user opts in via Settings toggle
          if (isMounted) setPushToken(null);
        }
      } catch (err) {
        console.warn('[usePushToken] Error during launch permission check:', err);
        if (isMounted) setPushToken(null);
      }
    }

    checkExistingPermission();

    return () => {
      isMounted = false;
    };
  }, [setPushToken]);
}
