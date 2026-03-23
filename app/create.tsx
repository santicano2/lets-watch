import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { createRoom } from '@/services/firebase/rooms';

/**
 * Pantalla para crear una nueva sala
 * Pide el nombre del creador y genera un código único
 */
export default function CreateRoomScreen() {
  const router = useRouter();
  const [creatorName, setCreatorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    // Validación
    if (!creatorName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const room = await createRoom(creatorName.trim());
      
      // Navegar a la sala creada
      router.push(`/room/${room.code}` as any);
    } catch (err) {
      console.error('Error creating room:', err);
      Alert.alert(
        'Error',
        'No se pudo crear la sala. Por favor intenta de nuevo.'
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
            Crear Sala
          </Text>
          <Text className="text-gray-400">
            Crea una sala y comparte el código con tus amigos
          </Text>
        </View>

        {/* Ilustración */}
        <View className="items-center mb-8">
          <Text className="text-6xl mb-4">🎬</Text>
          <View className="bg-gray-800 rounded-2xl p-6 w-full">
            <Text className="text-center text-gray-400 mb-2">
              Tu código de sala será:
            </Text>
            <Text className="text-center text-4xl font-bold text-green-500 tracking-widest">
              ABC123
            </Text>
            <Text className="text-center text-xs text-gray-500 mt-2">
              (Se generará automáticamente)
            </Text>
          </View>
        </View>

        {/* Form */}
        <View className="gap-6">
          <Input
            label="Tu nombre"
            placeholder="Ej: Juan Pérez"
            value={creatorName}
            onChangeText={(text) => {
              setCreatorName(text);
              if (error) setError('');
            }}
            error={error}
            maxLength={30}
            autoFocus
          />

          <Button
            onPress={handleCreateRoom}
            loading={loading}
            disabled={loading}
            size="lg"
          >
            Crear Sala
          </Button>
        </View>

        {/* Info */}
        <View className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <Text className="text-blue-400 text-sm">
            💡 <Text className="font-semibold">Tip:</Text> Una vez creada la sala, 
            podrás compartir el código o link con tus amigos para que se unan.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
