import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { getPosterUrl } from '@/services/tmdb/config';
import type { RoomMovie } from '@/types/domain';

interface MovieVoteCardProps {
  movie: RoomMovie;
  userVote?: 'upvote' | 'downvote' | null;
  onUpvote: () => void;
  onDownvote: () => void;
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
  onPress,
}: MovieVoteCardProps) {
  const posterUrl = getPosterUrl(movie.posterPath);
  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : 'N/A';

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {/* Poster */}
        <View className="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700">
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

        {/* Info */}
        <View className="p-3 gap-1">
          <Text
            className="text-base font-semibold text-gray-900 dark:text-white"
            numberOfLines={2}
          >
            {movie.title}
          </Text>

          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {releaseYear}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Botones de votación */}
      <View className="flex-row border-t border-gray-200 dark:border-gray-700">
        {/* Downvote */}
        <TouchableOpacity
          onPress={onDownvote}
          className={`flex-1 flex-row items-center justify-center gap-2 py-3 ${
            userVote === 'downvote' ? 'bg-red-50 dark:bg-red-900/20' : ''
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-xl ${
              userVote === 'downvote'
                ? 'text-red-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            👎
          </Text>
          <Text
            className={`text-base font-semibold ${
              userVote === 'downvote'
                ? 'text-red-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {movie.downvotes}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="w-px bg-gray-200 dark:bg-gray-700" />

        {/* Score */}
        <View className="px-4 items-center justify-center bg-gray-50 dark:bg-gray-900/30">
          <Text
            className={`text-lg font-bold ${
              movie.score > 0
                ? 'text-green-500'
                : movie.score < 0
                ? 'text-red-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {movie.score > 0 ? '+' : ''}
            {movie.score}
          </Text>
        </View>

        {/* Divider */}
        <View className="w-px bg-gray-200 dark:bg-gray-700" />

        {/* Upvote */}
        <TouchableOpacity
          onPress={onUpvote}
          className={`flex-1 flex-row items-center justify-center gap-2 py-3 ${
            userVote === 'upvote' ? 'bg-green-50 dark:bg-green-900/20' : ''
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-xl ${
              userVote === 'upvote'
                ? 'text-green-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            👍
          </Text>
          <Text
            className={`text-base font-semibold ${
              userVote === 'upvote'
                ? 'text-green-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {movie.upvotes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
