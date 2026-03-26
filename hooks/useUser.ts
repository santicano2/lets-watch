import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@lets_watch_user_id';

/**
 * Genera un ID único para el usuario
 * Formato: user_<timestamp>_<random>
 */
function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${random}`;
}

/**
 * Hook para obtener un ID de usuario anónimo persistente
 * El ID se genera una vez y se guarda en AsyncStorage
 * 
 * @returns { userId, loading } - ID del usuario y estado de carga
 */
export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrCreateUserId();
  }, []);

  const loadOrCreateUserId = async () => {
    try {
      // Intentar cargar ID existente
      let storedId = await AsyncStorage.getItem(USER_ID_KEY);

      if (!storedId) {
        // Si no existe, generar uno nuevo y guardarlo
        storedId = generateUserId();
        await AsyncStorage.setItem(USER_ID_KEY, storedId);
      }

      setUserId(storedId);
    } catch (error) {
      console.error('Error loading user ID:', error);
      // En caso de error, generar uno temporal (no persistido)
      setUserId(generateUserId());
    } finally {
      setLoading(false);
    }
  };

  return { userId, loading };
}
