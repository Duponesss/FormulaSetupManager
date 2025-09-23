import { Stack, useRouter, useSegments } from "expo-router";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { useEffect } from "react";
import '../global.css';

// Este componente interno gere a lógica de redirecionamento
function RootNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Se o estado de autenticação ainda estiver a carregar, não faz nada
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Se o utilizador NÃO está logado E NÃO está na tela de autenticação,
    // redireciona-o para a tela de login.
    if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    }
    // Se o utilizador ESTÁ logado E ESTÁ na tela de autenticação,
    // redireciona-o para a tela principal (tabs).
    else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }

  }, [user, loading, segments]); // Re-executa sempre que o estado do utilizador ou a rota mudar

  // O Stack define quais grupos de rotas existem na raiz da app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

// O layout raiz agora providencia todos os contextos necessários
export default function RootLayout() {
  return (
    <GluestackUIProvider>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </GluestackUIProvider>
  );
}