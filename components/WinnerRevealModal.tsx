import * as Haptics from "expo-haptics";
import { Trophy } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

import { getPosterUrl } from "@/services/tmdb/config";
import type { RoomMovie } from "@/types/domain";

interface WinnerRevealModalProps {
  visible: boolean;
  winner: RoomMovie | null;
  candidates: RoomMovie[];
  onClose: () => void;
}

export function WinnerRevealModal({
  visible,
  winner,
  candidates,
  onClose,
}: WinnerRevealModalProps) {
  const [currentMovieId, setCurrentMovieId] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!visible || !winner) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (candidates.length > 1) {
      setIsAnimating(true);
      let index = 0;
      setCurrentMovieId(candidates[0].id);

      interval = setInterval(() => {
        index = (index + 1) % candidates.length;
        setCurrentMovieId(candidates[index].id);
      }, 120);

      timeout = setTimeout(() => {
        if (interval) clearInterval(interval);
        setCurrentMovieId(winner.id);
        setIsAnimating(false);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }, 2600);
    } else {
      setCurrentMovieId(winner.id);
      setIsAnimating(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [visible, winner, candidates]);

  const displayMovie = useMemo(() => {
    if (!winner) return null;
    return candidates.find((movie) => movie.id === currentMovieId) || winner;
  }, [candidates, currentMovieId, winner]);

  if (!winner || !displayMovie) return null;

  const posterUrl = getPosterUrl(displayMovie.posterPath);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/95 items-center justify-center px-6">
        <View className="items-center mb-4">
          <Trophy size={40} color="#22c55e" strokeWidth={2} />
        </View>

        <Text className="text-white text-2xl font-bold mb-1">
          {isAnimating ? "Eligiendo al azar..." : "Película ganadora"}
        </Text>

        {candidates.length > 1 && (
          <Text className="text-gray-400 text-sm mb-4">
            Empate entre {candidates.length} películas
          </Text>
        )}

        <View className="w-56 aspect-[2/3] bg-gray-900 overflow-hidden mb-4">
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-gray-500">Sin poster</Text>
            </View>
          )}
        </View>

        <Text className="text-white text-xl font-semibold text-center mb-1">
          {displayMovie.title}
        </Text>
        <Text className="text-gray-400 text-sm mb-6">
          Score final: {displayMovie.score > 0 ? "+" : ""}
          {displayMovie.score}
        </Text>

        <TouchableOpacity
          className={`px-6 py-3 rounded-xl ${isAnimating ? "bg-gray-700" : "bg-green-500"}`}
          onPress={onClose}
          activeOpacity={0.8}
          disabled={isAnimating}
        >
          <Text className="text-white font-semibold">Cerrar resultado</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
