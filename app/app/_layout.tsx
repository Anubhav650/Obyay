import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors, letterSpacing } from "../src/theme/tokens";
import * as SplashScreen from "expo-splash-screen";

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.accentDark,
  headerTitleStyle: { fontWeight: "600" as const },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
  animation: "slide_from_right" as const,
};

const INDEX_SCREEN_OPTIONS = {
  title: "Hob-Yay! 🙌🏻",
  headerLargeTitle: true,
  headerLargeTitleShadowVisible: true,
  headerLargeTitleStyle: {
    color: colors.accentDark,
    fontWeight: "800" as const,
  },
  headerBackVisible: false,
};

const NEW_HOBBY_SCREEN_OPTIONS = {
  presentation: "modal" as const,
  title: "New Hobby",
  headerStyle: { backgroundColor: colors.surface },
};

const HOBBY_DETAIL_SCREEN_OPTIONS = {
  title: "",
  headerBackTitle: "Back",
};

const ONBOARDING_SCREEN_OPTIONS = {
  headerShown: false,
  gestureEnabled: false,
};

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <BottomSheetModalProvider>
        <Stack screenOptions={SCREEN_OPTIONS}>
          <Stack.Screen name="index" options={INDEX_SCREEN_OPTIONS} />
          <Stack.Screen name="NewHobby" options={NEW_HOBBY_SCREEN_OPTIONS} />
          <Stack.Screen
            name="hobby/[hobbyId]"
            options={HOBBY_DETAIL_SCREEN_OPTIONS}
          />
          <Stack.Screen name="onboarding" options={ONBOARDING_SCREEN_OPTIONS} />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});

export default RootLayout;
