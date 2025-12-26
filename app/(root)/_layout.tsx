import { Stack } from "expo-router";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="find-ride"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="confirm-ride"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="book-ride"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
    </Stack>
  );
}
