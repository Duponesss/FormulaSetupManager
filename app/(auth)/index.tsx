import { Redirect } from "expo-router";
import { useAuth } from "../../src/hooks/use-auth";
import AuthScreen from "../../src/screens/AuthScreen";

export default function AuthIndex() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <AuthScreen />;
}
