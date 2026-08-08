import { Stack } from "expo-router";
import { AuthProvider } from "../lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="trip/[tripId]" />
        <Stack.Screen name="public-trip/[tripId]" />
        <Stack.Screen name="guide/[guideId]" />
      </Stack>
    </AuthProvider>
  );
}
