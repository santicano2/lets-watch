import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import "react-native-reanimated";
import { useEffect } from "react";

import "../global.css";

export default function RootLayout() {
  // Ocultar barra de navegación en Android
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="create" />
        <Stack.Screen name="join" />
        <Stack.Screen name="room/[code]/index" />
        <Stack.Screen name="room/[code]/search" />
      </Stack>
      <StatusBar hidden />
    </>
  );
}
