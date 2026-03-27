import { Globe } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { POPULAR_COUNTRIES } from "@/hooks/useCountry";

interface CountryPickerModalProps {
  visible: boolean;
  onSelect: (countryCode: string) => void;
}

/**
 * Modal para seleccionar el país del usuario
 * Se muestra cuando no se puede detectar automáticamente
 */
export function CountryPickerModal({
  visible,
  onSelect,
}: CountryPickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {}}
    >
      <View className="flex-1 bg-black/90 justify-end">
        <View className="bg-gray-900 rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="p-6 border-b border-gray-800">
            <View className="flex-row items-center gap-3 mb-2">
              <Globe size={28} color="#22c55e" strokeWidth={2} />
              <Text className="text-2xl font-bold text-white">
                Selecciona tu país
              </Text>
            </View>
            <Text className="text-gray-400">
              Esto nos ayuda a mostrarte dónde ver las películas en tu región
            </Text>
          </View>

          {/* Lista de países */}
          <FlatList
            data={POPULAR_COUNTRIES}
            keyExtractor={(item) => item.code}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800/50 active:bg-gray-800"
                onPress={() => onSelect(item.code)}
              >
                <Text className="text-white text-lg">{item.name}</Text>
                <Text className="text-gray-500 text-sm">{item.code}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
