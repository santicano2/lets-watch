import { ThumbsDown, ThumbsUp, Trash2 } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { getPosterUrl } from "@/services/tmdb/config";
import type { RoomMovie } from "@/types/domain";

interface MovieVoteCardProps {
  movie: RoomMovie;
  userVote?: "upvote" | "downvote" | null;
  onUpvote: () => void;
  onDownvote: () => void;
  onDelete?: () => void;
  onPress?: () => void;
}

/**
 * Card de película con botones de votación
 * Usado en la pantalla principal de la sala
 */
export function MovieVoteCard({
  movie,
  userVote,
  onUpvote,
  onDownvote,
  onDelete,
  onPress,
}: MovieVoteCardProps) {
  const posterUrl = getPosterUrl(movie.posterPath);
  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : "N/A";

  return (
    <View
      className="bg-gray-900 rounded overflow-hidden"
      style={{ aspectRatio: 0.55 }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-1"
      >
        {/* Poster */}
        <View className="flex-1 bg-gray-800">
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

          {/* Botón de eliminar */}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              className="absolute top-2 right-2 bg-red-500 rounded-full w-8 h-8 items-center justify-center"
              activeOpacity={0.8}
            >
              <Trash2 size={16} color="white" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Info */}
        <View className="px-3 py-2 h-14 justify-center">
          <Text className="text-sm font-semibold text-white" numberOfLines={1}>
            {movie.title}
          </Text>

          <Text className="text-xs text-gray-400">{releaseYear}</Text>
        </View>
      </TouchableOpacity>

      {/* Botones de votación */}
      <View className="flex-row border-t border-gray-800 h-12">
        {/* Downvote */}
        <TouchableOpacity
          onPress={onDownvote}
          className={`flex-1 flex-row items-center justify-center gap-1 ${
            userVote === "downvote" ? "bg-red-900/20" : ""
          }`}
          activeOpacity={0.7}
        >
          <ThumbsDown
            size={20}
            color={userVote === "downvote" ? "#ef4444" : "#9ca3af"}
            strokeWidth={2}
            fill={userVote === "downvote" ? "#ef4444" : "none"}
          />
          <Text
            className={`text-sm font-semibold ${userVote === "downvote" ? "text-red-500" : "text-gray-400"}`}
          >
            {movie.downvotes}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="w-px bg-gray-800" />

        {/* Score */}
        <View className="px-2 items-center justify-center bg-gray-900/50">
          <Text
            className={`text-lg font-bold ${
              movie.score > 0
                ? "text-green-500"
                : movie.score < 0
                  ? "text-red-500"
                  : "text-gray-400"
            }`}
          >
            {movie.score > 0 ? "+" : ""}
            {movie.score}
          </Text>
        </View>

        {/* Divider */}
        <View className="w-px bg-gray-800" />

        {/* Upvote */}
        <TouchableOpacity
          onPress={onUpvote}
          className={`flex-1 flex-row items-center justify-center gap-1 ${
            userVote === "upvote" ? "bg-green-900/20" : ""
          }`}
          activeOpacity={0.7}
        >
          <ThumbsUp
            size={20}
            color={userVote === "upvote" ? "#22c55e" : "#9ca3af"}
            strokeWidth={2}
            fill={userVote === "upvote" ? "#22c55e" : "none"}
          />
          <Text
            className={`text-sm font-semibold ${userVote === "upvote" ? "text-green-500" : "text-gray-400"}`}
          >
            {movie.upvotes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
