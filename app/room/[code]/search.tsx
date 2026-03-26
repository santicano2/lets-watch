import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, TrendingUp } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useUser } from "@/hooks/useUser";
import {
  addMovieToRoom,
  getMoviesInRoom,
  removeMovieFromRoom,
} from "@/services/firebase/movies";
import { getPopularMovies, searchMovies } from "@/services/tmdb/client";
import type { TMDBMovie } from "@/types/tmdb";

import { MovieCard, MovieDetailsModal, SearchBar } from "@/components";

/**
 * Pantalla de búsqueda y selección de películas
 * Permite buscar películas en TMDB y agregarlas a la sala
 */
export default function SearchMovieScreen() {
  const params = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const roomCode = params.code?.toUpperCase();

  // Hook para obtener el ID del usuario
  const { userId } = useUser();

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [existingMovieIds, setExistingMovieIds] = useState<Set<number>>(
    new Set(),
  );
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Cargar películas populares y películas ya agregadas al inicio
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    if (!roomCode) return;

    try {
      setInitialLoading(true);

      // Cargar en paralelo: películas populares + películas ya en la sala
      const [popularResponse, roomMovies] = await Promise.all([
        getPopularMovies(1),
        getMoviesInRoom(roomCode),
      ]);

      setMovies(popularResponse.results);
      setExistingMovieIds(new Set(roomMovies.map((m) => m.id)));
    } catch (error) {
      console.error("Error loading initial data:", error);
      Alert.alert("Error", "No se pudieron cargar las películas");
    } finally {
      setInitialLoading(false);
    }
  };

  // Manejar búsqueda (llamado por SearchBar con debounce)
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();

      // Si no hay query, no recargar (mantener cache de populares)
      if (!trimmedQuery && movies.length > 0) {
        return;
      }

      // Si borra todo el texto y no hay películas, recargar populares
      if (!trimmedQuery && movies.length === 0) {
        loadInitialData();
        return;
      }

      try {
        setLoading(true);
        const response = await searchMovies(trimmedQuery);
        setMovies(response.results);
      } catch (error) {
        console.error("Error searching movies:", error);
        Alert.alert("Error", "No se pudo realizar la búsqueda");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    },
    [movies.length, roomCode],
  );

  // Agregar película a la sala
  const handleAddMovie = async () => {
    if (!roomCode || !selectedMovie || !userId) {
      Alert.alert("Error", "No se pudo agregar la película. Intenta de nuevo.");
      return;
    }

    try {
      setModalLoading(true);

      await addMovieToRoom(
        roomCode,
        {
          id: selectedMovie.id,
          title: selectedMovie.title,
          posterPath: selectedMovie.poster_path,
          releaseDate: selectedMovie.release_date,
          overview: selectedMovie.overview,
        },
        userId,
      );

      // Actualizar la lista de películas existentes
      setExistingMovieIds((prev) => new Set([...prev, selectedMovie.id]));

      // Cerrar modal
      setSelectedMovie(null);
    } catch (error: any) {
      console.error("Error adding movie:", error);

      // Mostrar mensaje específico si la película ya existe
      if (error.message?.includes("ya existe")) {
        Alert.alert("Película duplicada", error.message);
      } else {
        Alert.alert("Error", "No se pudo agregar la película");
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Eliminar película de la sala
  const handleRemoveMovie = async () => {
    if (!roomCode || !selectedMovie) return;

    try {
      setModalLoading(true);

      await removeMovieFromRoom(roomCode, selectedMovie.id);

      // Actualizar la lista de películas existentes
      setExistingMovieIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedMovie.id);
        return newSet;
      });

      // Cerrar modal
      setSelectedMovie(null);
    } catch (error: any) {
      console.error("Error removing movie:", error);
      Alert.alert("Error", "No se pudo eliminar la película");
    } finally {
      setModalLoading(false);
    }
  };

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = 24; // px-6 = 24px per side
  const gap = 12; // gap entre cards
  const cardWidth = (screenWidth - horizontalPadding * 2 - gap) / 2;

  const renderMovieItem = ({
    item: movie,
    index,
  }: {
    item: TMDBMovie;
    index: number;
  }) => {
    const isAdded = existingMovieIds.has(movie.id);
    const isLeftColumn = index % 2 === 0;

    return (
      <View
        style={{
          width: cardWidth,
          marginBottom: 16,
          marginRight: isLeftColumn ? gap : 0,
        }}
      >
        <MovieCard
          movie={movie}
          variant="vertical"
          onPress={() => setSelectedMovie(movie)}
        />

        {/* Badge si ya está agregada */}
        {isAdded && (
          <View className="absolute top-2 right-2 bg-green-500 rounded-full px-2 py-1">
            <Text className="text-white text-xs font-semibold">Agregada</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="bg-gray-900 px-6 pt-12 pb-4 border-b border-gray-800">
        <View className="flex-row items-center gap-4 mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={24} color="white" strokeWidth={2} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">
              Buscar Película
            </Text>
            <Text className="text-sm text-gray-400">Sala {roomCode}</Text>
          </View>
        </View>

        {/* SearchBar */}
        <SearchBar
          placeholder="Buscar películas..."
          onSearch={(q) => {
            setQuery(q);
            handleSearch(q);
          }}
          debounceMs={500}
        />
      </View>

      {/* Content */}
      <View className="flex-1">
        {/* Header de sección */}
        <View className="px-6 pt-6">
          {!query && (
            <View className="flex-row items-center gap-2 mb-4">
              <TrendingUp size={20} color="#22c55e" strokeWidth={2} />
              <Text className="text-lg font-semibold text-white">
                Películas Populares
              </Text>
            </View>
          )}

          {query && (
            <Text className="text-lg font-semibold text-white mb-4">
              Resultados para &quot;{query}&quot;
            </Text>
          )}
        </View>

        {/* Loading inicial */}
        {initialLoading && (
          <View className="flex-1 items-center justify-center px-6">
            <ActivityIndicator size="large" color="#22c55e" />
            <Text className="text-gray-400 mt-4">Cargando películas...</Text>
          </View>
        )}

        {/* Loading búsqueda */}
        {loading && !initialLoading && (
          <View className="flex-1 items-center justify-center px-6">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-400 mt-4">Buscando...</Text>
          </View>
        )}

        {/* Sin resultados */}
        {!loading && !initialLoading && movies.length === 0 && query && (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-white text-xl font-bold mb-2">
              Sin resultados
            </Text>
            <Text className="text-gray-400 text-center">
              No se encontraron películas para &quot;{query}&quot;
            </Text>
          </View>
        )}

        {/* Grid de películas con FlatList */}
        {!initialLoading && movies.length > 0 && (
          <FlatList
            data={movies}
            numColumns={2}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              paddingBottom: 24,
              paddingTop: 8,
              paddingHorizontal: 24,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal de detalles */}
      <MovieDetailsModal
        movie={selectedMovie}
        visible={selectedMovie !== null}
        onClose={() => setSelectedMovie(null)}
        onAdd={handleAddMovie}
        onRemove={handleRemoveMovie}
        isAdded={selectedMovie ? existingMovieIds.has(selectedMovie.id) : false}
        isLoading={modalLoading}
      />
    </View>
  );
}
