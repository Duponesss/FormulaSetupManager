import { Stack, useRouter, useSegments } from "expo-router";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { useSetupStore } from "../src/stores/setupStore"; 
import { useEffect } from "react";
import { Box } from '../components/ui/box';
import { Spinner } from '../components/ui/spinner';
import * as SplashScreen from 'expo-splash-screen';
import '../global.css';
import { Text } from '../components/ui/text';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from "nativewind";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

function RootNavigation() {
  const router = useRouter();
  const segments = useSegments();
  const { user, loading: isAuthLoading } = useAuth();
  const { listenToUserSetups, fetchGameData, gameData, listenToUserProfile } = useSetupStore();

  useEffect(() => {
    fetchGameData('F124');
    let unsubscribeSetups: (() => void) | null = null;
    let unsubscribeProfile: (() => void) | null = null;
    if (user) {
      unsubscribeSetups = listenToUserSetups();
      unsubscribeProfile = listenToUserProfile(user.uid); 
    }
    return () => {
      if (unsubscribeSetups) unsubscribeSetups();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [user]);


  const isDataReady = gameData !== null;

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthLoading && isDataReady) {
      SplashScreen.hideAsync();
      if (user && inAuthGroup) {
        router.replace('/(tabs)'); 
      } else if (!user && !inAuthGroup) {
        router.replace('/login');
      }
    }
  }, [user, isAuthLoading, isDataReady, segments, router]);

  if (isAuthLoading || !isDataReady) {
    return (
      <Box className="flex-1 items-center justify-center bg-black">
        <Spinner size="large" color="#ef4444"/>
        <Text className="text-white mt-4">Carregando...</Text>
      </Box>
    );
  }

  return (
    <Stack
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}


export default function RootLayout() {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme("light");
  }, []);
  return (
    <GluestackUIProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </GluestackUIProvider>
  );
}