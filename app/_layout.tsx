import { Stack } from "expo-router";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { useSetupStore } from "../src/stores/setupStore"; 
import { useEffect } from "react";
import '../global.css';

function RootNavigation() {
  const { user, loading: isAuthLoading } = useAuth();
  const { loadAllSetups } = useSetupStore();

  useEffect(() => {
    if (user) {
      loadAllSetups();
    }
  }, [user]);
  
  if (isAuthLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{ headerShown: false }}
      // A propriedade 'initialRouteName' define a tela de arranque do navegador.
      initialRouteName={user ? '(tabs)' : '(auth)'}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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