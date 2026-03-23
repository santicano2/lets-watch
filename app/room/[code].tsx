import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { getRoomByCode, incrementParticipantCount } from '@/services/firebase/rooms';
import { getMoviesInRoom } from '@/services/firebase/movies';
import { MovieVoteCard } from '@/components';
import { Button } from '@/components/ui';
import type { Room, RoomMovie } from '@/types/domain';

/**
 * Pantalla principal de la sala de votación
 * Muestra las películas agregadas y permite votar
 */
export default function RoomScreen() {
  const params = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const roomCode = params.code?.toUpperCase();

  const [room, setRoom] = useState<Room | null>(null);
  const [movies, setMovies] = useState<RoomMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos de la sala
  const loadRoomData = async () => {
    if (!roomCode) return;

    try {
      const roomData = await getRoomByCode(roomCode);
      
      if (!roomData) {
        Alert.alert(
          'Sala no encontrada',
          'El código de sala no existe o fue eliminado.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      setRoom(roomData);

      // Incrementar contador de participantes (primera vez)
      if (!room) {
        await incrementParticipantCount(roomCode);
      }

      // Cargar películas
      const moviesData = await getMoviesInRoom(roomCode);
      setMovies(moviesData);
    } catch (error) {
      console.error('Error loading room:', error);
      Alert.alert('Error', 'No se pudo cargar la sala');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRoomData();
  }, [roomCode]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRoomData();
  };

  const handleShare = async () => {
    if (!roomCode) return;

    try {
      await Share.share({
        message: `¡Únete a mi sala de Let's Watch! 🍿\n\nCódigo: ${roomCode}\nLink: letswatch://room/${roomCode}`,
        title: 'Invitación a Let\'s Watch',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleVote = (movieId: number, voteType: 'upvote' | 'downvote') => {
    // TODO: Implementar lógica de votación en FASE 6
    console.log(`Vote ${voteType} for movie ${movieId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg">Cargando sala...</Text>
      </View>
    );
  }

  if (!room) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-6xl mb-4">😕</Text>
        <Text className="text-white text-xl font-bold mb-2">Sala no encontrada</Text>
        <Text className="text-gray-400 text-center mb-6">
          El código de sala no existe o fue eliminado
        </Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }

  const winnerMovie = room.status === 'closed' && room.selectedMovieId
    ? movies.find(m => m.id === room.selectedMovieId)
    : movies.length > 0 ? movies[0] : null;

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="bg-gray-900 px-6 pt-12 pb-6 border-b border-gray-800">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white mb-1">
              Sala {roomCode}
            </Text>
            <Text className="text-gray-400">
              por {room.creatorName} · {room.participantCount} participante{room.participantCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleShare}
            className="bg-blue-500 rounded-xl px-4 py-2"
          >
            <Text className="text-white font-semibold">Compartir</Text>
          </TouchableOpacity>
        </View>

        {/* Badge de estado */}
        {room.status === 'closed' && (
          <View className="bg-red-500/20 border border-red-500 rounded-lg px-3 py-2 mt-2">
            <Text className="text-red-400 text-sm font-semibold">
              🔒 Votación cerrada
            </Text>
          </View>
        )}
      </View>

      {/* Winner Badge */}
      {winnerMovie && room.status === 'closed' && (
        <View className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-b border-green-500/30 px-6 py-4">
          <Text className="text-green-400 font-bold text-lg mb-1">
            🏆 Película Ganadora
          </Text>
          <Text className="text-white text-xl font-bold">
            {winnerMovie.title}
          </Text>
          <Text className="text-gray-400">
            Score: {winnerMovie.score > 0 ? '+' : ''}{winnerMovie.score}
          </Text>
        </View>
      )}

      {/* Lista de películas */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {movies.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-6xl mb-4">🎬</Text>
            <Text className="text-white text-xl font-bold mb-2 text-center">
              No hay películas todavía
            </Text>
            <Text className="text-gray-400 text-center mb-6">
              Sé el primero en agregar una película a la sala
            </Text>
            {room.status === 'voting' && (
              <Link href={`/room/${roomCode}/search` as any} asChild>
                <Button>Agregar Película</Button>
              </Link>
            )}
          </View>
        ) : (
          <View className="gap-4">
            {movies.map((movie) => (
              <MovieVoteCard
                key={movie.id}
                movie={movie}
                userVote={null} // TODO: Implementar en FASE 6
                onUpvote={() => handleVote(movie.id, 'upvote')}
                onDownvote={() => handleVote(movie.id, 'downvote')}
                onPress={() => {
                  // TODO: Abrir modal de detalles en FASE 7
                  console.log('Show details for', movie.id);
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB - Agregar película */}
      {room.status === 'voting' && movies.length > 0 && (
        <Link href={`/room/${roomCode}/search` as any} asChild>
          <TouchableOpacity
            className="absolute bottom-6 right-6 bg-green-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white text-3xl">+</Text>
          </TouchableOpacity>
        </Link>
      )}
    </View>
  );
}
