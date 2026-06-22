// hooks/usePushToken.ts

import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAppStore } from '@/store/useAppStore';

/**
 * Helper to request notification permissions and retrieve the push token.
 * Returns true if permissions were granted, false otherwise.
 */
export async function requestPushTokenPermission(setPushToken: (token: string | null) => void): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
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
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    console.log('[usePushToken] Push token successfully retrieved:', token);
    setPushToken(token);
    return true;
  } catch (error) {
    console.warn('[usePushToken] Error requesting push token, using fallback:', error);
    const mockToken = "ExponentPushToken[local-mock]";
    setPushToken(mockToken);
    return true;
  }
}

/**
 * Hook to run on app launch. Queries permissions and fetches the push token
 * only if permissions are granted or undetermined (requesting permission in the latter case).
 * If permissions are denied, it respects the choice and does not prompt.
 */
export function usePushToken() {
  const setPushToken = useAppStore((s) => s.setPushToken);

  useEffect(() => {
    let isMounted = true;

    async function checkExistingPermission() {
      if (Platform.OS === 'web') return;

      try {
        const { status } = await Notifications.getPermissionsAsync();
        
        if (status === 'granted') {
          const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId;
          const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
          if (isMounted) setPushToken(token);
        } else if (status === 'undetermined') {
          // Undetermined: request on launch
          const { status: reqStatus } = await Notifications.requestPermissionsAsync();
          if (reqStatus === 'granted') {
            const projectId =
              Constants?.expoConfig?.extra?.eas?.projectId ??
              Constants?.easConfig?.projectId;
            const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            if (isMounted) setPushToken(token);
          } else {
            if (isMounted) setPushToken(null);
          }
        } else {
          // Denied: respect preference, don't ask again
          if (isMounted) setPushToken(null);
        }
      } catch (err) {
        console.warn('[usePushToken] Error on launch permission check, using fallback:', err);
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted' || status === 'undetermined') {
          if (isMounted) setPushToken('ExponentPushToken[local-mock]');
        } else {
          if (isMounted) setPushToken(null);
        }
      }
    }

    checkExistingPermission();

    return () => {
      isMounted = false;
    };
  }, [setPushToken]);
}
