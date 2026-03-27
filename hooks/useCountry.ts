import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { useCallback, useEffect, useState } from "react";

const COUNTRY_STORAGE_KEY = "@letswatch/user_country";

/**
 * Lista de países populares para streaming
 * Ordenados por uso común en Latinoamérica y otros mercados
 */
export const POPULAR_COUNTRIES = [
  { code: "MX", name: "México" },
  { code: "AR", name: "Argentina" },
  { code: "CO", name: "Colombia" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Perú" },
  { code: "ES", name: "España" },
  { code: "US", name: "Estados Unidos" },
  { code: "BR", name: "Brasil" },
  { code: "VE", name: "Venezuela" },
  { code: "EC", name: "Ecuador" },
  { code: "GT", name: "Guatemala" },
  { code: "CR", name: "Costa Rica" },
  { code: "PA", name: "Panamá" },
  { code: "DO", name: "República Dominicana" },
  { code: "UY", name: "Uruguay" },
  { code: "PY", name: "Paraguay" },
  { code: "BO", name: "Bolivia" },
  { code: "HN", name: "Honduras" },
  { code: "SV", name: "El Salvador" },
  { code: "NI", name: "Nicaragua" },
] as const;

export type CountryCode = (typeof POPULAR_COUNTRIES)[number]["code"];

/**
 * Intenta detectar el código de país del dispositivo
 * @returns Código ISO 3166-1 o null si no se puede detectar
 */
function detectCountryCode(): string | null {
  try {
    const locale = Localization.getLocales()[0];

    // El código de región está en locale.regionCode
    if (locale?.regionCode) {
      return locale.regionCode.toUpperCase();
    }

    // Fallback: intentar extraer del languageTag (ej: "es-MX" -> "MX")
    if (locale?.languageTag) {
      const parts = locale.languageTag.split("-");
      if (parts.length > 1) {
        const region = parts[parts.length - 1].toUpperCase();
        // Verificar que sea un código de país válido (2 letras)
        if (region.length === 2) {
          return region;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Hook para manejar el país del usuario para providers de streaming
 * Detecta automáticamente si es posible, sino pide al usuario que seleccione
 */
export function useCountry() {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSelection, setNeedsSelection] = useState(false);

  // Cargar país guardado o detectar
  useEffect(() => {
    async function loadCountry() {
      try {
        // Primero intentar cargar del storage
        const savedCountry = await AsyncStorage.getItem(COUNTRY_STORAGE_KEY);

        if (savedCountry) {
          setCountryCode(savedCountry);
          setNeedsSelection(false);
        } else {
          // Intentar detectar automáticamente
          const detectedCountry = detectCountryCode();

          if (detectedCountry) {
            // Verificar si el país detectado está en nuestra lista
            const isKnownCountry = POPULAR_COUNTRIES.some(
              (c) => c.code === detectedCountry,
            );

            if (isKnownCountry) {
              setCountryCode(detectedCountry);
              // Guardar para futuras sesiones
              await AsyncStorage.setItem(COUNTRY_STORAGE_KEY, detectedCountry);
              setNeedsSelection(false);
            } else {
              // País desconocido, pedir selección
              setNeedsSelection(true);
            }
          } else {
            // No se pudo detectar, pedir selección
            setNeedsSelection(true);
          }
        }
      } catch (error) {
        console.error("Error loading country:", error);
        setNeedsSelection(true);
      } finally {
        setLoading(false);
      }
    }

    loadCountry();
  }, []);

  // Función para seleccionar país manualmente
  const selectCountry = useCallback(async (code: string) => {
    try {
      await AsyncStorage.setItem(COUNTRY_STORAGE_KEY, code);
      setCountryCode(code);
      setNeedsSelection(false);
    } catch (error) {
      console.error("Error saving country:", error);
    }
  }, []);

  // Función para cambiar país (forzar selección)
  const changeCountry = useCallback(() => {
    setNeedsSelection(true);
  }, []);

  return {
    countryCode,
    loading,
    needsSelection,
    selectCountry,
    changeCountry,
  };
}
