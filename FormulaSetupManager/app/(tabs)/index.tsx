import { useRouter } from "expo-router";
import HomeScreen from "../../src/screens/HomeScreen";

export default function HomeIndex() {
  const router = useRouter();

  // Create a navigation object that matches React Navigation's interface
  const navigation = {
    navigate: (screen: string, params?: any) => {
      switch (screen) {
        case "CreateSetup":
          router.push("/(tabs)/create-setup");
          break;
        case "SetupDetails":
          router.push(`/(tabs)/setup-details?setupId=${params.setupId}`);
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

  return <HomeScreen navigation={navigation} />;
}
