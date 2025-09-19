import { useLocalSearchParams, useRouter } from "expo-router";
import CreateSetupScreen from "../../src/screens/CreateSetupScreen";

export default function CreateSetup() {
  const router = useRouter();
  const { setupId } = useLocalSearchParams();

  // Create a navigation object that matches React Navigation's interface
  const navigation = {
    navigate: (screen: string, params?: any) => {
      const routeMap: Record<string, string> = {
        'Home': '/(tabs)/',
        'CreateSetup': '/(tabs)/create-setup',
        'SetupDetails': '/(tabs)/setup-details',
        'create-setup': '/(tabs)/create-setup',
        'setup-details': '/(tabs)/setup-details',
        'index': '/(tabs)/',
      };
      
      const route = routeMap[screen.toLowerCase()] || '/(tabs)/';
      router.push(route as any);
    },
    goBack: () => router.back(),
    // Add other navigation methods to satisfy the interface
    dispatch: () => {},
    reset: () => {},
    isFocused: () => true,
    canGoBack: () => router.canGoBack(),
    getId: () => undefined,
    getParent: () => undefined,
    getState: () => ({} as any),
  } as any;

  const route = {
    params: {
      setupId: setupId as string,
    },
  };

  return <CreateSetupScreen navigation={navigation} route={route} />;
}
