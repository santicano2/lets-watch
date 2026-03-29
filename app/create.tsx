import { useRouter } from "expo-router";
import { Clapperboard, Clock, Lightbulb } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useUser } from "@/hooks/useUser";
import { addParticipant } from "@/services/firebase/participants";
import { createRoom } from "@/services/firebase/rooms";
import type { RoomDuration } from "@/types/domain";
import { saveLastRoomCode } from "@/utils/lastRoom";

import { Button, Input } from "@/components/ui";

/** Opciones de duración disponibles */
const DURATION_OPTIONS: { value: RoomDuration; label: string }[] = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hora" },
  { value: 120, label: "2 horas" },
];

/**
 * Pantalla para crear una nueva sala
 * Pide el nombre del creador, duración y genera un código único
 */
export default function CreateRoomScreen() {
  const router = useRouter();
  const { userId } = useUser();
  const [creatorName, setCreatorName] = useState("");
  const [duration, setDuration] = useState<RoomDuration>(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    // Validación
    if (!creatorName.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    if (!userId) {
      Alert.alert(
        "Error",
        "No se pudo identificar al usuario. Reinicia la app.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const room = await createRoom({
        creatorName: creatorName.trim(),
        creatorId: userId,
        duration,
      });

      // Registrar al creador como participante
      await addParticipant(room.code, userId, creatorName.trim(), true);

      // Guardar última sala para rejoin rápido
      await saveLastRoomCode(room.code);

      // Navegar a la sala creada (isCreator=true para no incrementar contador)
      router.push(`/room/${room.code}?isCreator=true` as any);
    } catch (err) {
      console.error("Error creating room:", err);
      Alert.alert(
        "Error",
        "No se pudo crear la sala. Por favor intenta de nuevo.",
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
          <Text className="text-3xl font-bold text-white mb-2">Crear Sala</Text>
          <Text className="text-gray-400">
            Crea una sala y comparte el código con tus amigos
          </Text>
        </View>

        {/* Ilustración */}
        <View className="items-center mb-8">
          <View className="mb-4">
            <Clapperboard size={64} color="#22c55e" strokeWidth={1.5} />
          </View>
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
              if (error) setError("");
            }}
            error={error}
            maxLength={30}
            autoFocus
          />

          {/* Selector de duración */}
          <View className="gap-2">
            <View className="flex-row items-center gap-2 mb-1">
              <Clock size={16} color="#9ca3af" strokeWidth={2} />
              <Text className="text-gray-400 font-medium">
                Duración de la votación
              </Text>
            </View>
            <View className="flex-row gap-2">
              {DURATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setDuration(option.value)}
                  className={`flex-1 py-3 rounded-xl border ${
                    duration === option.value
                      ? "bg-green-500/20 border-green-500"
                      : "bg-gray-800 border-gray-700"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-center font-medium ${
                      duration === option.value
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
          <View className="flex-row gap-2">
            <Lightbulb size={20} color="#60a5fa" strokeWidth={1.5} />
            <View className="flex-1">
              <Text className="text-blue-400 text-sm">
                <Text className="font-semibold">Tip:</Text> La votación se
                cerrará cuando el tiempo termine o cuando todos marquen
                &quot;Estoy listo&quot;.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
