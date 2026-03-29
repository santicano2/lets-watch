import React, { useEffect, useState } from "react";
import { Animated, Text } from "react-native";

interface ToastProps {
  message: string;
  visible: boolean;
  duration?: number;
  onHide?: () => void;
  type?: "success" | "info" | "warning";
}

/**
 * Componente Toast simple para mostrar notificaciones temporales
 */
export function Toast({
  message,
  visible,
  duration = 3000,
  onHide,
  type = "info",
}: ToastProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide después de duration
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, onHide]);

  if (!visible) return null;

  const bgColor = {
    success: "bg-green-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  }[type];

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={`absolute top-16 left-6 right-6 ${bgColor} rounded-xl px-4 py-3 z-50 shadow-lg`}
    >
      <Text className="text-white font-medium text-center">{message}</Text>
    </Animated.View>
  );
}
