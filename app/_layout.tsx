import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { NotificationBanner } from '../components/NotificationBanner';
import { useStore } from '../store/useStore';

export default function RootLayout() {
  const user = useStore((state) => state.user);
  const authToken = useStore((state) => state.authToken);
  const syncWithBackend = useStore((state) => state.syncWithBackend);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    syncWithBackend();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const rootSegment = segments[0];
      if (!rootSegment) return;

      // These screens are always accessible once mounted
      const freeScreens = ['workout-summary', 'active-workout', 'exercise-library', 'add-food', 'meal-plan'];
      if (freeScreens.includes(rootSegment)) return;

      // A user with a valid authToken is fully authenticated — never send them to onboarding again
      const isFullyAuthenticated = !!user && !!authToken;

      if (!user || !authToken) {
        if (rootSegment !== 'login') router.replace('/login');
      } else if (!isFullyAuthenticated || !user.isOnboarded) {
        // Only redirect new users (no token yet) to onboarding
        if (!authToken && rootSegment !== 'onboarding') {
          router.replace('/onboarding');
        } else if (authToken && (rootSegment === 'login' || rootSegment === 'onboarding')) {
          // Already authenticated, get them out of login/onboarding
          router.replace('/(tabs)');
        }
      } else {
        if (rootSegment === 'login' || rootSegment === 'onboarding') {
          router.replace('/(tabs)');
        }
      }
    }, 100);
  }, [user, authToken, segments]);

  return (
    <ThemeProvider value={DarkTheme}>
      <NotificationBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="exercise-library" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-food" options={{ presentation: 'modal' }} />
        <Stack.Screen name="meal-plan" options={{ presentation: 'modal' }} />
        <Stack.Screen name="active-workout" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="workout-summary" options={{ presentation: 'fullScreenModal', headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
