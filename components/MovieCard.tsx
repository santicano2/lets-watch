import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { getPosterUrl } from "@/services/tmdb/config";
import type { TMDBMovie } from "@/types/tmdb";

interface MovieCardProps {
  movie: TMDBMovie;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "horizontal" | "vertical";
}

/**
 * Card de película para resultados de búsqueda
 * Muestra poster, título y año
 * Soporta dos variantes: horizontal (lista) y vertical (grid)
 */
export function MovieCard({
  movie,
  onPress,
  disabled = false,
  variant = "horizontal",
}: MovieCardProps) {
  const posterUrl = getPosterUrl(movie.poster_path);
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  // Variante vertical para grid
  if (variant === "vertical") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
      >
        {/* Poster */}
        <View className="w-full aspect-[2/3] bg-gray-700">
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-gray-400 text-xs">Sin imagen</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="p-3 gap-1">
          <Text className="text-sm font-semibold text-white" numberOfLines={2}>
            {movie.title}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">{releaseYear}</Text>

            {movie.vote_average > 0 && (
              <View className="flex-row items-center gap-1">
                <Text className="text-yellow-500 text-xs">★</Text>
                <Text className="text-xs text-gray-300">
                  {movie.vote_average.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Variante horizontal para lista
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className="flex-row gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700"
    >
      {/* Poster */}
      <View className="w-20 h-28 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-gray-400 text-xs">Sin imagen</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 justify-center gap-1">
        <Text
          className="text-base font-semibold text-gray-900 dark:text-white"
          numberOfLines={2}
        >
          {movie.title}
        </Text>

        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {releaseYear}
        </Text>

        {movie.vote_average > 0 && (
          <View className="flex-row items-center gap-1">
            <Text className="text-yellow-500 text-sm">★</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              {movie.vote_average.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
