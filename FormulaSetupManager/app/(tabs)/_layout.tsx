import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/hooks/use-auth";

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Loading handled by root layout
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create-setup" />
      <Stack.Screen name="setup-details" />
      <Stack.Screen name="aerodynamics" />
      <Stack.Screen name="suspension" />
      <Stack.Screen name="tires-brakes" />
    </Stack>
  );
}
