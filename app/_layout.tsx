// Configurar Reanimated PRIMERO (antes de importarlo)
import "../reanimated.config";

import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogBox, Platform } from "react-native";

import "react-native-reanimated";
import "../global.css";

// Silenciar cualquier warning restante de Reanimated
LogBox.ignoreLogs(["[Reanimated]"]);

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
