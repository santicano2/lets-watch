import * as Clipboard from "expo-clipboard";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import {
  Copy,
  Film,
  Frown,
  Lock,
  Plus,
  Share2,
  Trophy,
  Users,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  Share,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

import { useUser } from "@/hooks/useUser";
import {
  removeMovieFromRoom,
  subscribeToMovies,
} from "@/services/firebase/movies";
import {
  setParticipantReady,
  subscribeToParticipants,
} from "@/services/firebase/participants";
import { closeVoting, subscribeToRoom } from "@/services/firebase/rooms";
import { castVote, subscribeToUserVotes } from "@/services/firebase/votes";
import type { Participant, Room, RoomMovie, VoteType } from "@/types/domain";
import type { TMDBMovie } from "@/types/tmdb";

import {
  CountdownTimer,
  MovieDetailsModal,
  MovieVoteCard,
  ParticipantsModal,
  Toast,
  WinnerRevealModal,
} from "@/components";
import { Button } from "@/components/ui";
import { saveLastRoomCode } from "@/utils/lastRoom";

/**
 * Pantalla principal de la sala de votación
 * Muestra las películas agregadas y permite votar en tiempo real
 */
export default function RoomScreen() {
  const params = useLocalSearchParams<{ code: string; isCreator?: string }>();
  const router = useRouter();
  const roomCode = params.code?.toUpperCase();

  // Hook para obtener el ID del usuario
  const { userId } = useUser();

  const [room, setRoom] = useState<Room | null>(null);
  const [movies, setMovies] = useState<RoomMovie[]>([]);
  const [userVotes, setUserVotes] = useState<Map<number, VoteType>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerCandidates, setWinnerCandidates] = useState<RoomMovie[]>([]);

  // Estado para el modal de detalles
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Estado para participantes
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsModalVisible, setParticipantsModalVisible] =
    useState(false);

  // Refs para trackear estado
  const hasLoadedParticipantsRef = useRef(false);
  const previousParticipantsRef = useRef<Participant[]>([]);
  const hasClosedByReadyRef = useRef(false);
  const hasShownWinnerModalRef = useRef(false);

  const [updatingReady, setUpdatingReady] = useState(false);

  // Callback para cuando el tiempo termina
  const handleTimeExpired = useCallback(async () => {
    if (!roomCode || !room || room.status === "closed") return;

    try {
      // Cerrar la votación (sin ganador aún - se determinará en FASE 11)
      await closeVoting(roomCode);
    } catch (error) {
      console.error("Error closing voting:", error);
    }
  }, [roomCode, room]);

  // Suscripción en tiempo real a la sala
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = subscribeToRoom(
      roomCode,
      (updatedRoom) => {
        if (!updatedRoom) {
          Alert.alert(
            "Sala no encontrada",
            "El código de sala no existe o fue eliminado.",
            [{ text: "OK", onPress: () => router.back() }],
          );
          return;
        }
        setRoom(updatedRoom);
        setLoading(false);
      },
      (error) => {
        console.error("Error in room subscription:", error);
        Alert.alert("Error", "No se pudo cargar la sala");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [roomCode, router]);

  // Guardar última sala para rejoin rápido
  useEffect(() => {
    if (!roomCode) return;
    saveLastRoomCode(roomCode).catch((error) => {
      console.error("Error saving last room code:", error);
    });
  }, [roomCode, userId]);

  // Cerrar votación cuando todos están listos
  useEffect(() => {
    if (!roomCode || !room || room.status !== "voting") return;
    if (participants.length === 0) return;

    const allReady = participants.every((participant) => participant.isReady);
    if (!allReady || hasClosedByReadyRef.current) return;

    hasClosedByReadyRef.current = true;
    closeVoting(roomCode).catch((error) => {
      console.error("Error closing voting by ready state:", error);
      hasClosedByReadyRef.current = false;
    });
  }, [roomCode, room, participants]);

  useEffect(() => {
    if (!roomCode || !room || room.status !== "closed") return;
    if (room.selectedMovieId || movies.length === 0) return;

    const maxScore = Math.max(...movies.map((movie) => movie.score));
    const tiedMovies = movies.filter((movie) => movie.score === maxScore);
    const randomIndex = Math.floor(Math.random() * tiedMovies.length);
    const selectedMovieId = tiedMovies[randomIndex].id;

    setWinnerCandidates(tiedMovies);

    closeVoting(roomCode, selectedMovieId).catch((error) => {
      console.error("Error selecting random winner:", error);
    });
  }, [roomCode, room, movies]);

  useEffect(() => {
    if (!room) return;

    if (room.status === "voting") {
      hasShownWinnerModalRef.current = false;
      setShowWinnerModal(false);
      return;
    }

    if (
      room.status === "closed" &&
      room.selectedMovieId &&
      !hasShownWinnerModalRef.current
    ) {
      if (winnerCandidates.length === 0 && movies.length > 0) {
        const maxScore = Math.max(...movies.map((movie) => movie.score));
        setWinnerCandidates(movies.filter((movie) => movie.score === maxScore));
      }

      hasShownWinnerModalRef.current = true;
      setShowWinnerModal(true);
    }
  }, [room, movies, winnerCandidates.length]);

  // Suscripción en tiempo real a las películas
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = subscribeToMovies(
      roomCode,
      (updatedMovies) => {
        setMovies(updatedMovies);
        setRefreshing(false);
      },
      (error) => {
        console.error("Error in movies subscription:", error);
      },
    );

    return () => unsubscribe();
  }, [roomCode, userId]);

  // Suscripción en tiempo real a los votos del usuario
  useEffect(() => {
    if (!roomCode || !userId) return;

    const unsubscribe = subscribeToUserVotes(
      roomCode,
      userId,
      (votesMap) => {
        setUserVotes(votesMap);
      },
      (error) => {
        console.error("Error in votes subscription:", error);
      },
    );

    return () => unsubscribe();
  }, [roomCode, userId]);

  // Suscripción en tiempo real a los participantes
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = subscribeToParticipants(
      roomCode,
      (updatedParticipants) => {
        if (hasLoadedParticipantsRef.current) {
          const previousIds = new Set(
            previousParticipantsRef.current.map(
              (participant) => participant.userId,
            ),
          );

          const newParticipants = updatedParticipants.filter(
            (participant) =>
              !previousIds.has(participant.userId) &&
              participant.userId !== userId,
          );

          if (newParticipants.length > 0) {
            const latest = newParticipants[newParticipants.length - 1];
            setToastMessage(`${latest.name} se unio a la sala`);
            setShowToast(true);
          }
        }

        previousParticipantsRef.current = updatedParticipants;
        hasLoadedParticipantsRef.current = true;
        setParticipants(updatedParticipants);
      },
      (error) => {
        console.error("Error in participants subscription:", error);
      },
    );

    return () => unsubscribe();
  }, [roomCode, userId]);

  // Refresh manual - solo actualiza el estado de refreshing
  // Las suscripciones en tiempo real se encargan de los datos
  const handleRefresh = () => {
    setRefreshing(true);
    // El refreshing se pondrá en false cuando lleguen los datos de la suscripción
    // Timeout de seguridad por si no hay cambios
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Copiar código al portapapeles
  const handleCopyCode = async () => {
    if (!roomCode) return;

    try {
      await Clipboard.setStringAsync(roomCode);

      // Mostrar feedback según plataforma
      if (Platform.OS === "android") {
        ToastAndroid.show("Código copiado", ToastAndroid.SHORT);
      } else {
        Alert.alert("Copiado", `Código ${roomCode} copiado al portapapeles`);
      }
    } catch (error) {
      console.error("Error copying:", error);
    }
  };

  // Compartir sala con deep link
  const handleShare = async () => {
    if (!roomCode || !room) return;

    const message = [
      `${room.creatorName} te invita a votar peliculas en Let's Watch!`,
      ``,
      `Codigo de sala:`,
      ``,
      `   ${roomCode}`,
      ``,
      `1. Descarga Let's Watch`,
      `2. Toca "Unirse a Sala"`,
      `3. Ingresa el codigo ${roomCode}`,
    ].join("\n");

    try {
      await Share.share({
        message,
        title: `Unete a la sala ${roomCode}`,
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
      // Registrar el voto - las suscripciones en tiempo real actualizarán la UI
      await castVote(roomCode, movieId, userId, voteType);
    } catch (error) {
      console.error("Error voting:", error);
      Alert.alert("Error", "No se pudo registrar el voto");
    }
  };

  const handleToggleReady = async () => {
    if (!roomCode || !userId || !room || room.status !== "voting") return;

    const currentParticipant = participants.find(
      (participant) => participant.userId === userId,
    );

    if (!currentParticipant) {
      Alert.alert("Error", "No se encontró tu participante en la sala");
      return;
    }

    try {
      setUpdatingReady(true);
      await setParticipantReady(roomCode, userId, !currentParticipant.isReady);
    } catch (error) {
      console.error("Error toggling ready state:", error);
      Alert.alert("Error", "No se pudo actualizar tu estado");
    } finally {
      setUpdatingReady(false);
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
              // La suscripción en tiempo real actualizará la lista automáticamente
              await removeMovieFromRoom(roomCode!, movieId);
            } catch (error) {
              console.error("Error deleting movie:", error);
              Alert.alert("Error", "No se pudo eliminar la película");
            }
          },
        },
      ],
    );
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

  const visibleMovies = movies;

  const readyCount = participants.filter(
    (participant) => participant.isReady,
  ).length;
  const currentUserParticipant = participants.find(
    (participant) => participant.userId === userId,
  );
  const isCurrentUserReady = currentUserParticipant?.isReady ?? false;

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="bg-gray-900 px-6 pt-12 pb-6 border-b border-gray-800">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <TouchableOpacity
              onPress={handleCopyCode}
              className="flex-row items-center gap-2 mb-1"
              activeOpacity={0.7}
            >
              <Text className="text-2xl font-bold text-white">
                Sala {roomCode}
              </Text>
              <Copy size={18} color="#9ca3af" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setParticipantsModalVisible(true)}
              className="flex-row items-center gap-1"
              activeOpacity={0.7}
            >
              <Text className="text-gray-400">por {room.creatorName} · </Text>
              <Users size={14} color="#9ca3af" strokeWidth={2} />
              <Text className="text-gray-400 underline">
                {participants.length > 0
                  ? participants.length
                  : room.participantCount}{" "}
                participante
                {(participants.length > 0
                  ? participants.length
                  : room.participantCount) !== 1
                  ? "s"
                  : ""}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleShare}
            className="bg-blue-500 rounded-xl p-3"
            activeOpacity={0.7}
          >
            <Share2 size={22} color="white" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Badge de estado */}
        {room.status === "closed" ? (
          <View className="bg-red-500/20 border border-red-500 rounded-lg px-3 py-2 mt-2">
            <View className="flex-row items-center gap-2">
              <Lock size={16} color="#f87171" strokeWidth={2} />
              <Text className="text-red-400 text-sm font-semibold">
                Votación cerrada
              </Text>
            </View>
          </View>
        ) : (
          /* Countdown timer */
          <View className="mt-2">
            <CountdownTimer endsAt={room.endsAt} onExpire={handleTimeExpired} />
          </View>
        )}

        {room.status === "voting" && (
          <View className="mt-3 flex-row items-center gap-2">
            <View className="flex-1 bg-gray-800 rounded-lg px-3 py-2">
              <Text className="text-gray-300 text-sm">
                {readyCount}/{participants.length} listos
              </Text>
            </View>
            <Button
              size="sm"
              variant={isCurrentUserReady ? "outline" : "primary"}
              onPress={handleToggleReady}
              disabled={updatingReady}
            >
              {isCurrentUserReady ? "Quitar listo" : "Estoy listo"}
            </Button>
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

      {/* Lista de películas (2 columnas) */}
      {visibleMovies.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12 px-6">
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
        <FlatList
          className="flex-1"
          data={visibleMovies}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 120,
            paddingHorizontal: 24,
          }}
          columnWrapperStyle={{ gap: 12, marginBottom: 16 }}
          renderItem={({ item: movie }) => (
            <View
              style={{
                width: (Dimensions.get("window").width - 24 * 2 - 12) / 2,
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
        />
      )}

      {/* FAB - Agregar película */}
      {room.status === "voting" && visibleMovies.length > 0 && (
        <Link href={`/room/${roomCode}/search` as any} asChild>
          <TouchableOpacity
            className="absolute bottom-6 right-6 bg-green-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
            activeOpacity={0.8}
          >
            <Plus size={32} color="white" strokeWidth={2} />
          </TouchableOpacity>
        </Link>
      )}

      <Toast
        message={toastMessage}
        visible={showToast}
        type="success"
        onHide={() => setShowToast(false)}
      />

      {/* Modal de detalles de película */}
      <MovieDetailsModal
        movie={selectedMovie}
        visible={detailsModalVisible}
        onClose={handleCloseDetails}
        isAdded={true}
      />

      {/* Modal de participantes */}
      <ParticipantsModal
        visible={participantsModalVisible}
        onClose={() => setParticipantsModalVisible(false)}
        participants={participants}
        currentUserId={userId}
      />

      <WinnerRevealModal
        visible={showWinnerModal}
        winner={winnerMovie || null}
        candidates={winnerCandidates}
        onClose={() => setShowWinnerModal(false)}
      />
    </View>
  );
}
