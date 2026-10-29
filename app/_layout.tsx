import { CormorantGaramond_600SemiBold, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond';
import { NotoSerifKR_600SemiBold, NotoSerifKR_700Bold } from '@expo-google-fonts/noto-serif-kr';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { useStore } from '@/lib/store';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    NotoSerifKR_600SemiBold,
    NotoSerifKR_700Bold,
  });
  const hydrated = useStore((s) => s.hydrated);
  const hasProfile = useStore((s) => !!s.profile);
  const segments = useSegments();
  const router = useRouter();
  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {});
    const inOnboarding = segments[0] === 'onboarding';
    if (!hasProfile && !inOnboarding) router.replace('/onboarding');
    if (hasProfile && inOnboarding) router.replace('/');
  }, [ready, hasProfile, segments, router]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.cream },
          headerTintColor: Colors.navy,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.cream },
          headerBackTitle: '뒤로',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="module/[id]" options={{ title: '' }} />
      </Stack>
    </>
  );
}
