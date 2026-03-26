import { Calendar, Star, X } from "lucide-react-native";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getTMDBImageUrl } from "@/services/tmdb/config";
import type { TMDBMovie } from "@/types/tmdb";

import { Button } from "@/components/ui";

interface MovieDetailsModalProps {
  movie: TMDBMovie | null;
  visible: boolean;
  onClose: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
  isAdded?: boolean;
  isLoading?: boolean;
}

/**
 * Modal de detalles de película
 * Muestra información completa y permite agregar o eliminar
 */
export function MovieDetailsModal({
  movie,
  visible,
  onClose,
  onAdd,
  onRemove,
  isAdded = false,
  isLoading = false,
}: MovieDetailsModalProps) {
  if (!movie) return null;

  const posterUrl = getTMDBImageUrl(movie.poster_path, "w500");
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <TouchableOpacity
          className="absolute top-12 right-6 z-10 w-10 h-10 items-center justify-center bg-gray-800 rounded-full"
          onPress={onClose}
        >
          <X size={24} color="white" strokeWidth={2} />
        </TouchableOpacity>

        <ScrollView
          className="flex-1 pt-12"
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Poster */}
          <View className="w-full aspect-[2/3] bg-gray-900">
            {posterUrl ? (
              <Image
                source={{ uri: posterUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Text className="text-gray-400">Sin imagen</Text>
              </View>
            )}
          </View>

          {/* Detalles */}
          <View className="p-6 gap-4">
            {/* Título */}
            <Text className="text-3xl font-bold text-white">{movie.title}</Text>

            {/* Año y rating */}
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-2">
                <Calendar size={16} color="#9ca3af" strokeWidth={2} />
                <Text className="text-gray-400">{releaseYear}</Text>
              </View>

              {movie.vote_average > 0 && (
                <View className="flex-row items-center gap-2">
                  <Star
                    size={16}
                    color="#eab308"
                    strokeWidth={2}
                    fill="#eab308"
                  />
                  <Text className="text-gray-400">
                    {movie.vote_average.toFixed(1)}/10
                  </Text>
                </View>
              )}
            </View>

            {/* Sinopsis */}
            {movie.overview && (
              <View className="gap-2">
                <Text className="text-lg font-semibold text-white">
                  Sinopsis
                </Text>
                <Text className="text-gray-300 leading-6">
                  {movie.overview}
                </Text>
              </View>
            )}

            {/* Botones */}
            <View className="gap-3 mt-6 mb-2">
              {isAdded ? (
                <Button
                  variant="destructive"
                  size="lg"
                  onPress={onRemove}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Eliminar de la sala
                </Button>
              ) : (
                <Button
                  size="lg"
                  onPress={onAdd}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Agregar a la sala
                </Button>
              )}

              <Button
                variant="ghost"
                size="lg"
                onPress={onClose}
                disabled={isLoading}
              >
                Cerrar
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
