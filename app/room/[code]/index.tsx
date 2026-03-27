import {
  Link,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { Film, Frown, Lock, Plus, Trophy } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useUser } from "@/hooks/useUser";
import {
  getMoviesInRoom,
  removeMovieFromRoom,
} from "@/services/firebase/movies";
import {
  getRoomByCode,
  incrementParticipantCount,
} from "@/services/firebase/rooms";
import { castVote, getUserVotesInRoom } from "@/services/firebase/votes";
import type { Room, RoomMovie, VoteType } from "@/types/domain";
import type { TMDBMovie } from "@/types/tmdb";

import { MovieDetailsModal, MovieVoteCard } from "@/components";
import { Button } from "@/components/ui";

/**
 * Pantalla principal de la sala de votación
 * Muestra las películas agregadas y permite votar
 */
export default function RoomScreen() {
  const params = useLocalSearchParams<{ code: string; isCreator?: string }>();
  const router = useRouter();
  const roomCode = params.code?.toUpperCase();
  const isCreator = params.isCreator === "true";

  // Hook para obtener el ID del usuario
  const { userId, loading: userLoading } = useUser();

  const [room, setRoom] = useState<Room | null>(null);
  const [movies, setMovies] = useState<RoomMovie[]>([]);
  const [userVotes, setUserVotes] = useState<Map<number, VoteType>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);

  // Estado para el modal de detalles
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Refs para trackear estado
  const hasIncrementedRef = useRef(false); // Si ya se incrementó el contador
  const hasLoadedRef = useRef(false); // Si ya se hizo la carga inicial

  // Cargar votos del usuario
  const loadUserVotes = useCallback(async () => {
    if (!roomCode || !userId) return;

    try {
      const votes = await getUserVotesInRoom(roomCode, userId);
      // Convertir array de votos a Map para acceso rápido
      const votesMap = new Map<number, VoteType>();
      votes.forEach((vote) => {
        votesMap.set(vote.movieId, vote.voteType);
      });
      setUserVotes(votesMap);
    } catch (error) {
      console.error("Error loading user votes:", error);
    }
  }, [roomCode, userId]);

  // Cargar datos de la sala
  const loadRoomData = useCallback(
    async (shouldIncrement = false) => {
      if (!roomCode) return;

      try {
        const roomData = await getRoomByCode(roomCode);

        if (!roomData) {
          Alert.alert(
            "Sala no encontrada",
            "El código de sala no existe o fue eliminado.",
            [{ text: "OK", onPress: () => router.back() }],
          );
          return;
        }

        setRoom(roomData);

        // Incrementar contador de participantes solo si:
        // 1. Se pide incrementar (shouldIncrement = true)
        // 2. No es el creador de la sala (isCreator = false)
        // 3. No se ha incrementado antes (hasIncrementedRef.current = false)
        if (shouldIncrement && !isCreator && !hasIncrementedRef.current) {
          await incrementParticipantCount(roomCode);
          hasIncrementedRef.current = true;
        }

        // Cargar películas
        const moviesData = await getMoviesInRoom(roomCode);
        setMovies(moviesData);

        // Marcar que ya se hizo la carga inicial
        hasLoadedRef.current = true;
      } catch (error) {
        console.error("Error loading room:", error);
        Alert.alert("Error", "No se pudo cargar la sala");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [roomCode, isCreator, router],
  );

  // Cargar datos al montar (primera vez, incrementar contador)
  useEffect(() => {
    loadRoomData(true);
  }, [loadRoomData]);

  // Cargar votos del usuario cuando el userId esté disponible
  useEffect(() => {
    if (userId && roomCode) {
      loadUserVotes();
    }
  }, [userId, roomCode, loadUserVotes]);

  // Recargar datos cada vez que la pantalla gana foco (sin incrementar contador)
  useFocusEffect(
    useCallback(() => {
      // Solo recargar si ya se hizo la carga inicial
      if (hasLoadedRef.current) {
        loadRoomData(false);
        loadUserVotes();
      }
    }, [loadRoomData, loadUserVotes]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadRoomData(false);
    loadUserVotes();
  };

  const handleShare = async () => {
    if (!roomCode) return;

    try {
      await Share.share({
        message: `¡Únete a mi sala de Let's Watch!\n\nCódigo: ${roomCode}\nLink: letswatch://room/${roomCode}`,
        title: "Invitación a Let's Watch",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleVote = async (movieId: number, voteType: VoteType) => {
    if (!roomCode || !userId) {
      Alert.alert("Error", "No se pudo registrar el voto. Intenta de nuevo.");
      return;
    }

    try {
      // Registrar el voto
      await castVote(roomCode, movieId, userId, voteType);

      // Actualizar el estado local de votos del usuario
      setUserVotes((prev) => {
        const newVotes = new Map(prev);
        const currentVote = prev.get(movieId);

        if (currentVote === voteType) {
          // Toggle off - eliminar el voto
          newVotes.delete(movieId);
        } else {
          // Nuevo voto o switch
          newVotes.set(movieId, voteType);
        }

        return newVotes;
      });

      // Recargar películas para obtener los nuevos scores
      const moviesData = await getMoviesInRoom(roomCode);
      setMovies(moviesData);
    } catch (error) {
      console.error("Error voting:", error);
      Alert.alert("Error", "No se pudo registrar el voto");
    }
  };

  const handleDeleteMovie = (movieId: number, movieTitle: string) => {
    Alert.alert(
      "Eliminar película",
      `¿Seguro que quieres eliminar "${movieTitle}" de la sala?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMovieFromRoom(roomCode!, movieId);
              // Actualizar lista de películas
              setMovies((prev) => prev.filter((m) => m.id !== movieId));
              // Resetear índice si es necesario
              if (currentMovieIndex >= movies.length - 1) {
                setCurrentMovieIndex(Math.max(0, movies.length - 2));
              }
            } catch (error) {
              console.error("Error deleting movie:", error);
              Alert.alert("Error", "No se pudo eliminar la película");
            }
          },
        },
      ],
    );
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const cardWidth = Dimensions.get("window").width * 0.75 + 16;
    const index = Math.round(scrollPosition / cardWidth);
    setCurrentMovieIndex(index);
  };

  // Función para abrir el modal de detalles
  const handleShowDetails = (movie: RoomMovie) => {
    // Convertir RoomMovie a TMDBMovie (formato que espera el modal)
    const tmdbMovie: TMDBMovie = {
      id: movie.id,
      title: movie.title,
      original_title: movie.title,
      overview: movie.overview,
      poster_path: movie.posterPath,
      backdrop_path: null,
      release_date: movie.releaseDate,
      vote_average: 0,
      vote_count: 0,
      popularity: 0,
      adult: false,
      genre_ids: [],
    };
    setSelectedMovie(tmdbMovie);
    setDetailsModalVisible(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalVisible(false);
    setSelectedMovie(null);
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
        <View className="mb-4">
          <Frown size={64} color="#9ca3af" strokeWidth={1.5} />
        </View>
        <Text className="text-white text-xl font-bold mb-2">
          Sala no encontrada
        </Text>
        <Text className="text-gray-400 text-center mb-6">
          El código de sala no existe o fue eliminado
        </Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }

  const winnerMovie =
    room.status === "closed" && room.selectedMovieId
      ? movies.find((m) => m.id === room.selectedMovieId)
      : movies.length > 0
        ? movies[0]
        : null;

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
              por {room.creatorName} · {room.participantCount} participante
              {room.participantCount !== 1 ? "s" : ""}
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
        {room.status === "closed" && (
          <View className="bg-red-500/20 border border-red-500 rounded-lg px-3 py-2 mt-2">
            <View className="flex-row items-center gap-2">
              <Lock size={16} color="#f87171" strokeWidth={2} />
              <Text className="text-red-400 text-sm font-semibold">
                Votación cerrada
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Winner Badge */}
      {winnerMovie && room.status === "closed" && (
        <View className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-b border-green-500/30 px-6 py-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Trophy size={20} color="#22c55e" strokeWidth={2} />
            <Text className="text-green-400 font-bold text-lg">
              Película Ganadora
            </Text>
          </View>
          <Text className="text-white text-xl font-bold">
            {winnerMovie.title}
          </Text>
          <Text className="text-gray-400">
            Score: {winnerMovie.score > 0 ? "+" : ""}
            {winnerMovie.score}
          </Text>
        </View>
      )}

      {/* Lista de películas */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {movies.length === 0 ? (
          <View className="items-center justify-center py-12 px-6">
            <View className="mb-4">
              <Film size={64} color="#9ca3af" strokeWidth={1.5} />
            </View>
            <Text className="text-white text-xl font-bold mb-2 text-center">
              No hay películas todavía
            </Text>
            <Text className="text-gray-400 text-center mb-6">
              Sé el primero en agregar una película a la sala
            </Text>
            {room.status === "voting" && (
              <Link href={`/room/${roomCode}/search` as any} asChild>
                <Button>Agregar Película</Button>
              </Link>
            )}
          </View>
        ) : (
          <View className="py-6">
            {/* Carousel de películas */}
            <FlatList
              data={movies}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={Dimensions.get("window").width * 0.75 + 16}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 24 }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={({ item: movie }) => (
                <View
                  style={{
                    width: Dimensions.get("window").width * 0.75,
                    marginRight: 16,
                  }}
                >
                  <MovieVoteCard
                    movie={movie}
                    userVote={userVotes.get(movie.id) || null}
                    onUpvote={() => handleVote(movie.id, "upvote")}
                    onDownvote={() => handleVote(movie.id, "downvote")}
                    onDelete={
                      room.status === "voting"
                        ? () => handleDeleteMovie(movie.id, movie.title)
                        : undefined
                    }
                    onPress={() => handleShowDetails(movie)}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
            />

            {/* Indicador de posición */}
            {movies.length > 1 && (
              <View className="flex-row justify-center gap-2 mt-4">
                {movies.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentMovieIndex
                        ? "w-6 bg-green-500"
                        : "w-2 bg-gray-600"
                    }`}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB - Agregar película */}
      {room.status === "voting" && movies.length > 0 && (
        <Link href={`/room/${roomCode}/search` as any} asChild>
          <TouchableOpacity
            className="absolute bottom-6 right-6 bg-green-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
            activeOpacity={0.8}
          >
            <Plus size={32} color="white" strokeWidth={2} />
          </TouchableOpacity>
        </Link>
      )}

      {/* Modal de detalles de película */}
      <MovieDetailsModal
        movie={selectedMovie}
        visible={detailsModalVisible}
        onClose={handleCloseDetails}
        isAdded={true}
      />
    </View>
  );
}
