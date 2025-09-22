import { useLocalSearchParams, useRouter } from "expo-router";
import SetupDetailsScreen from "../../src/screens/SetupDetailsScreen";

export default function SetupDetails() {
  const router = useRouter();
  const { setupId } = useLocalSearchParams();

  // Create a navigation object that matches React Navigation's interface
  const navigation = {
    navigate: (screen: string, params?: any) => {
      switch (screen) {
        case "Aerodynamics":
          router.push(`/(tabs)/aerodynamics?setupId=${params.setupId}`);
          break;
        case "Suspension":
          router.push(`/(tabs)/suspension?setupId=${params.setupId}`);
          break;
        case "TiresBrakes":
          router.push(`/(tabs)/tires-brakes?setupId=${params.setupId}`);
          break;
        default:
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
      }
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

  return <SetupDetailsScreen navigation={navigation} route={route} />;
}
