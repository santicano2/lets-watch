import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, TrendingUp } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { addMovieToRoom } from "@/services/firebase/movies";
import { getPopularMovies, searchMovies } from "@/services/tmdb/client";
import type { TMDBMovie } from "@/types/tmdb";

import { MovieCard, SearchBar } from "@/components";

/**
 * Pantalla de búsqueda y selección de películas
 * Permite buscar películas en TMDB y agregarlas a la sala
 */
export default function SearchMovieScreen() {
  const params = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const roomCode = params.code?.toUpperCase();

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [addingMovieId, setAddingMovieId] = useState<number | null>(null);

  // Cargar películas populares al inicio
  useEffect(() => {
    loadPopularMovies();
  }, []);

  const loadPopularMovies = async () => {
    try {
      setInitialLoading(true);
      const response = await getPopularMovies(1);
      setMovies(response.results);
    } catch (error) {
      console.error("Error loading popular movies:", error);
      Alert.alert("Error", "No se pudieron cargar las películas populares");
    } finally {
      setInitialLoading(false);
    }
  };

  // Manejar búsqueda (llamado por SearchBar con debounce)
  const handleSearch = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();

    // Si no hay query, mostrar populares
    if (!trimmedQuery) {
      loadPopularMovies();
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
  }, []);

  // Agregar película a la sala
  const handleAddMovie = async (movie: TMDBMovie) => {
    if (!roomCode) return;

    try {
      setAddingMovieId(movie.id);

      // TODO FASE 6: Implementar hook useUser para obtener userId persistente
      // Por ahora generamos un ID temporal basado en timestamp
      const tempUserId = `user_${Date.now()}`;

      await addMovieToRoom(
        roomCode,
        {
          id: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          releaseDate: movie.release_date,
          overview: movie.overview,
        },
        tempUserId,
      );

      Alert.alert(
        "Película agregada",
        `"${movie.title}" fue agregada a la sala`,
        [
          {
            text: "Agregar otra",
            style: "cancel",
          },
          {
            text: "Volver a la sala",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error: any) {
      console.error("Error adding movie:", error);

      // Mostrar mensaje específico si la película ya existe
      if (error.message?.includes("ya existe")) {
        Alert.alert("Película duplicada", error.message);
      } else {
        Alert.alert("Error", "No se pudo agregar la película");
      }
    } finally {
      setAddingMovieId(null);
    }
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
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Header de sección */}
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

          {/* Loading inicial */}
          {initialLoading && (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="text-gray-400 mt-4">Cargando películas...</Text>
            </View>
          )}

          {/* Loading búsqueda */}
          {loading && !initialLoading && (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-400 mt-4">Buscando...</Text>
            </View>
          )}

          {/* Sin resultados */}
          {!loading && !initialLoading && movies.length === 0 && query && (
            <View className="items-center justify-center py-12">
              <Text className="text-white text-xl font-bold mb-2">
                Sin resultados
              </Text>
              <Text className="text-gray-400 text-center">
                No se encontraron películas para &quot;{query}&quot;
              </Text>
            </View>
          )}

          {/* Grid de películas */}
          {!initialLoading && movies.length > 0 && (
            <View className="flex-row flex-wrap gap-4">
              {movies.map((movie) => (
                <View key={movie.id} className="w-[48%]">
                  <MovieCard
                    movie={movie}
                    variant="vertical"
                    onPress={() => handleAddMovie(movie)}
                    disabled={addingMovieId === movie.id}
                  />
                  {addingMovieId === movie.id && (
                    <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-xl">
                      <ActivityIndicator size="small" color="white" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
