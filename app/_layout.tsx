import { Stack } from "expo-router";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { useSetupStore } from "../src/stores/setupStore"; 
import { useEffect } from "react";
import { Box } from '../components/ui/box';
import { Spinner } from '../components/ui/spinner';
import { SplashScreen } from 'expo-router';
import '../global.css';
import { useRouter } from 'expo-router';
import { Text } from '../components/ui/text';

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const { listenToUserSetups, fetchGameData, gameData } = useSetupStore();

  useEffect(() => {
    fetchGameData('F124');
    let unsubscribe: (() => void) | null = null;
    if (user) {
      unsubscribe = listenToUserSetups();
    }
    return () => {
      if (unsubscribe){ 
        unsubscribe();
      }
    };
  }, [user]);


  const isDataReady = gameData !== null;

  useEffect(() => {
    // Esconde o splash screen apenas quando a autenticação E o carregamento de dados terminarem
    if (!isAuthLoading && !isDataReady) {
      SplashScreen.hideAsync();
    }
  }, [isAuthLoading, isDataReady]);

  if (isAuthLoading || !isDataReady) {
    return (
      <Box className="flex-1 items-center justify-center">
        <Spinner size="large" />
        <Text>Carregando...</Text>
      </Box>
    );
  }

  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName={user ? '(tabs)' : '(auth)'}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}


export default function RootLayout() {
  return (
    <GluestackUIProvider>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </GluestackUIProvider>
  );
}