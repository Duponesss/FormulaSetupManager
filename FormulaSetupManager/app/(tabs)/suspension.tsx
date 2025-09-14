import { useLocalSearchParams, useRouter } from "expo-router";
import SuspensionScreen from "../../src/screens/SuspensionScreen";

export default function Suspension() {
  const router = useRouter();
  const { setupId } = useLocalSearchParams();

  // Create a navigation object that matches React Navigation's interface
  const navigation = {
    navigate: (screen: string, params?: any) => {
      const routeMap: Record<string, string> = {
        'aerodynamics': '/(tabs)/aerodynamics',
        'suspension': '/(tabs)/suspension',
        'tires-brakes': '/(tabs)/tires-brakes',
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

  return <SuspensionScreen navigation={navigation} route={route} />;
}
