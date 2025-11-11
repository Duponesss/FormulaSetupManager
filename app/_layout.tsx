import { Stack, useRouter, useSegments } from "expo-router";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { useSetupStore } from "../src/stores/setupStore"; 
import { useEffect } from "react";
import { Box } from '../components/ui/box';
import { Spinner } from '../components/ui/spinner';
import { SplashScreen } from 'expo-router';
import '../global.css';
import { Text } from '../components/ui/text';

SplashScreen.preventAutoHideAsync();

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
      // Se o usuário está logado, ouve os setups E o perfil dele
      unsubscribeSetups = listenToUserSetups();
      unsubscribeProfile = listenToUserProfile(user.uid); // <-- Adicionado
    }
    return () => {
      // Limpa os listeners ao deslogar
      if (unsubscribeSetups) unsubscribeSetups();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [user]);


  const isDataReady = gameData !== null;

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    // Espera TUDO carregar (autenticação E dados do jogo)
    if (!isAuthLoading && isDataReady) {
      // 1. Esconde o splash screen
      SplashScreen.hideAsync();

      // 2. Lógica de Redirecionamento
      if (user && inAuthGroup) {
        // CASO: Usuário logado (ou acabou de se cadastrar) E está nas telas de auth
        // AÇÃO: Redireciona para a home do app
        router.replace('/(tabs)'); 
      } else if (!user && !inAuthGroup) {
        // CASO: Usuário deslogado E NÃO está nas telas de auth (ex: estava no app e foi deslogado)
        // AÇÃO: Redireciona para o login
        router.replace('/login');
      }
      // Se user && !inAuthGroup (logado e no app) -> não faz nada
      // Se !user && inAuthGroup (deslogado e no login) -> não faz nada
    }
  }, [user, isAuthLoading, isDataReady, segments, router]);

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