/**
 * Configuración de Reanimated para deshabilitar strict mode
 * Este archivo debe importarse antes de cualquier uso de Reanimated
 */
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";

// Deshabilitar strict mode para evitar warnings molestos
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Deshabilitar strict mode
});
