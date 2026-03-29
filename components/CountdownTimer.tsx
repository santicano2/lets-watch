import { Clock } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

import { useCountdown } from "@/hooks/useCountdown";

interface CountdownTimerProps {
  /** Fecha cuando termina el countdown */
  endsAt: Date;
  /** Callback cuando el tiempo termina */
  onExpire?: () => void;
  /** Mostrar versión compacta (solo tiempo) */
  compact?: boolean;
}

/**
 * Componente que muestra el tiempo restante de una votación
 */
export function CountdownTimer({
  endsAt,
  onExpire,
  compact = false,
}: CountdownTimerProps) {
  const { formatted, isExpired, minutes } = useCountdown(endsAt, onExpire);

  // Determinar color según tiempo restante
  const getColorClasses = () => {
    if (isExpired)
      return {
        bg: "bg-red-500/20",
        border: "border-red-500",
        text: "text-red-400",
      };
    if (minutes < 1)
      return {
        bg: "bg-red-500/20",
        border: "border-red-500",
        text: "text-red-400",
      };
    if (minutes < 5)
      return {
        bg: "bg-yellow-500/20",
        border: "border-yellow-500",
        text: "text-yellow-400",
      };
    return {
      bg: "bg-green-500/20",
      border: "border-green-500",
      text: "text-green-400",
    };
  };

  const colors = getColorClasses();

  if (compact) {
    return (
      <View
        className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${colors.bg}`}
      >
        <Clock
          size={14}
          color={isExpired ? "#f87171" : minutes < 5 ? "#fbbf24" : "#22c55e"}
          strokeWidth={2}
        />
        <Text className={`font-bold ${colors.text}`}>
          {isExpired ? "Terminado" : formatted}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`${colors.bg} border ${colors.border} rounded-xl px-4 py-3`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Clock
            size={18}
            color={isExpired ? "#f87171" : minutes < 5 ? "#fbbf24" : "#22c55e"}
            strokeWidth={2}
          />
          <Text className="text-gray-400 text-sm">
            {isExpired ? "Votación terminada" : "Tiempo restante"}
          </Text>
        </View>
        <Text className={`text-xl font-bold ${colors.text}`}>
          {isExpired ? "00:00" : formatted}
        </Text>
      </View>
    </View>
  );
}
