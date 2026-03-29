import { Crown, User, X } from "lucide-react-native";
import React from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";

import type { Participant } from "@/types/domain";

interface ParticipantsModalProps {
  visible: boolean;
  onClose: () => void;
  participants: Participant[];
  currentUserId?: string | null;
}

/**
 * Modal que muestra la lista de participantes de una sala
 */
export function ParticipantsModal({
  visible,
  onClose,
  participants,
  currentUserId,
}: ParticipantsModalProps) {
  const renderParticipant = ({ item }: { item: Participant }) => {
    const isCurrentUser = item.userId === currentUserId;

    return (
      <View className="flex-row items-center px-4 py-3 border-b border-gray-800">
        {/* Avatar */}
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            item.isCreator ? "bg-green-500/20" : "bg-gray-800"
          }`}
        >
          {item.isCreator ? (
            <Crown size={20} color="#22c55e" strokeWidth={2} />
          ) : (
            <User size={20} color="#9ca3af" strokeWidth={2} />
          )}
        </View>

        {/* Nombre */}
        <View className="flex-1 ml-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-white font-medium">
              {item.name}
              {isCurrentUser && (
                <Text className="text-gray-500"> (t{"\u00fa"})</Text>
              )}
            </Text>
          </View>
          {item.isCreator && (
            <Text className="text-green-500 text-xs">Creador de la sala</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-gray-900 rounded-t-3xl max-h-[70%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
            <Text className="text-xl font-bold text-white">
              Participantes ({participants.length})
            </Text>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-800"
              onPress={onClose}
            >
              <X size={20} color="white" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Lista de participantes */}
          {participants.length === 0 ? (
            <View className="items-center justify-center py-12">
              <User size={48} color="#6b7280" strokeWidth={1.5} />
              <Text className="text-gray-500 mt-4">
                No hay participantes a{"\u00fa"}n
              </Text>
            </View>
          ) : (
            <FlatList
              data={participants}
              renderItem={renderParticipant}
              keyExtractor={(item) => item.userId}
              contentContainerStyle={{ paddingBottom: 32 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
