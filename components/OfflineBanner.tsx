import { WifiOff } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

interface OfflineBannerProps {
  visible: boolean;
}

export function OfflineBanner({ visible }: OfflineBannerProps) {
  if (!visible) return null;

  return (
    <View className="absolute top-10 left-4 right-4 z-50 bg-red-500/95 border border-red-400 rounded-xl px-4 py-3 flex-row items-center gap-2">
      <WifiOff size={18} color="white" strokeWidth={2} />
      <Text className="text-white text-sm font-medium flex-1">
        Sin conexion a internet. Algunas funciones pueden fallar.
      </Text>
    </View>
  );
}
