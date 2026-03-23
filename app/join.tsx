import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { getRoomByCode } from '@/services/firebase/rooms';
import { isValidRoomCode } from '@/utils/roomCode';

/**
 * Pantalla para unirse a una sala existente con código
 */
export default function JoinRoomScreen() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinRoom = async () => {
    // Validación
    const code = roomCode.trim().toUpperCase();
    
    if (!code) {
      setError('Por favor ingresa un código');
      return;
    }

    if (!isValidRoomCode(code)) {
      setError('El código debe tener 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const room = await getRoomByCode(code);

      if (!room) {
        setError('Sala no encontrada. Verifica el código.');
        setLoading(false);
        return;
      }

      if (room.status === 'closed') {
        Alert.alert(
          'Sala cerrada',
          'Esta sala ya finalizó la votación.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Navegar a la sala
      router.push(`/room/${code}` as any);
    } catch (err) {
      console.error('Error joining room:', err);
      Alert.alert(
        'Error',
        'No se pudo unir a la sala. Por favor intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-white mb-2">
            Unirse a Sala
          </Text>
          <Text className="text-gray-400">
            Ingresa el código que te compartieron
          </Text>
        </View>

        {/* Ilustración */}
        <View className="items-center mb-8">
          <Text className="text-6xl mb-4">🔗</Text>
        </View>

        {/* Form */}
        <View className="gap-6">
          <Input
            label="Código de sala"
            placeholder="ABC123"
            value={roomCode}
            onChangeText={(text) => {
              // Auto-uppercase y limitar a 6 caracteres
              setRoomCode(text.toUpperCase());
              if (error) setError('');
            }}
            error={error}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
          />

          <Button
            onPress={handleJoinRoom}
            loading={loading}
            disabled={loading || roomCode.length !== 6}
            size="lg"
          >
            Unirse a Sala
          </Button>
        </View>

        {/* Info */}
        <View className="mt-8 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <Text className="text-green-400 text-sm">
            💡 <Text className="font-semibold">Tip:</Text> El código de sala 
            tiene 6 caracteres (letras y números). También puedes usar el link 
            que te compartieron.
          </Text>
        </View>

        {/* Ejemplo visual */}
        <View className="mt-6 items-center">
          <Text className="text-gray-500 text-xs mb-2">Ejemplo de código:</Text>
          <View className="bg-gray-800 rounded-xl px-6 py-3">
            <Text className="text-2xl font-bold text-white tracking-widest">
              XYZ789
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
