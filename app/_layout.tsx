import { Stack } from "expo-router";
import { SafeAreaView, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ClerkProvider } from "@clerk/clerk-expo";
import InitialLayout from "@/components/InitialLayout";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
