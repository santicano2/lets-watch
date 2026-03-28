// Configurar Reanimated PRIMERO (antes de importarlo)
import "../reanimated.config";

import * as Linking from "expo-linking";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, useRouter } from "expo-router";
import { setStatusBarHidden } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import { ActivityIndicator, LogBox, Platform, Text, View } from "react-native";

import "react-native-reanimated";
import "../global.css";

// Silenciar cualquier warning restante de Reanimated
LogBox.ignoreLogs(["[Reanimated]"]);

export default function RootLayout() {
  const router = useRouter();
  const [isProcessingLink, setIsProcessingLink] = useState(false);

  // Configurar UI del sistema (status bar, navigation bar)
  useEffect(() => {
    // Ocultar status bar
    setStatusBarHidden(true, "none");

    // Configurar Android
    if (Platform.OS === "android") {
      // Ocultar barra de navegación
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
      NavigationBar.setBackgroundColorAsync("#000000");
      
      // Configurar color de fondo del sistema
      SystemUI.setBackgroundColorAsync("#000000");
    }
  }, []);

  // Manejar deep links
  useEffect(() => {
    // Función para procesar la URL
    const handleDeepLink = (url: string | null) => {
      if (!url) return;

      try {
        const parsed = Linking.parse(url);

        // Manejar letswatch://room/CODIGO
        if (parsed.path?.startsWith("room/")) {
          const code = parsed.path.replace("room/", "").toUpperCase();
          if (code && code.length === 6) {
            setIsProcessingLink(true);
            // Pequeño delay para asegurar que la navegación esté lista
            setTimeout(() => {
              router.replace(`/room/${code}`);
              setIsProcessingLink(false);
            }, 100);
          }
        }
      } catch (error) {
        console.error("Error processing deep link:", error);
      }
    };

    // Verificar si la app se abrió con un deep link
    Linking.getInitialURL().then(handleDeepLink);

    // Escuchar deep links mientras la app está abierta
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  // Mostrar loading mientras se procesa el deep link
  if (isProcessingLink) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-white mt-4">Abriendo sala...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="join" />
      <Stack.Screen name="room/[code]/index" />
      <Stack.Screen name="room/[code]/search" />
    </Stack>
  );
}
