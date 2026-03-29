import { useCallback, useEffect, useState } from "react";

interface CountdownResult {
  /** Tiempo restante en milisegundos */
  timeLeft: number;
  /** Si el countdown ya terminó */
  isExpired: boolean;
  /** Tiempo formateado como "MM:SS" o "HH:MM:SS" */
  formatted: string;
  /** Minutos restantes */
  minutes: number;
  /** Segundos restantes */
  seconds: number;
  /** Horas restantes (si aplica) */
  hours: number;
}

/**
 * Hook para manejar un countdown hasta una fecha específica
 * @param endDate - Fecha/hora cuando termina el countdown
 * @param onExpire - Callback opcional que se ejecuta cuando termina
 */
export function useCountdown(
  endDate: Date | null,
  onExpire?: () => void,
): CountdownResult {
  const calculateTimeLeft = useCallback(() => {
    if (!endDate) return 0;
    const now = new Date().getTime();
    const end = endDate.getTime();
    return Math.max(0, end - now);
  }, [endDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    if (!endDate) return;

    // Actualizar inmediatamente
    setTimeLeft(calculateTimeLeft());

    // Actualizar cada segundo
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Si llegó a 0, ejecutar callback y limpiar
      if (newTimeLeft <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, calculateTimeLeft, onExpire]);

  const isExpired = timeLeft <= 0;

  // Calcular componentes de tiempo
  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Formatear como string
  const formatted =
    hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return {
    timeLeft,
    isExpired,
    formatted,
    minutes,
    seconds,
    hours,
  };
}
