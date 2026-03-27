import { Calendar, Clock, Star, X, Tv, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCountry } from "@/hooks/useCountry";
import { getTMDBImageUrl, getProfileUrl } from "@/services/tmdb/config";
import { getMovieDetails, getMovieWatchProviders, getMovieCredits } from "@/services/tmdb/client";
import type { TMDBMovie, TMDBMovieDetails, TMDBProvider, TMDBCastMember } from "@/types/tmdb";

import { Button } from "@/components/ui";
import { CountryPickerModal } from "@/components/CountryPickerModal";

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
 * Formatea la duración en horas y minutos
 */
function formatRuntime(minutes: number | null): string {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Modal de detalles de película
 * Carga información completa desde TMDB y permite agregar o eliminar
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
  const [details, setDetails] = useState<TMDBMovieDetails | null>(null);
  const [providers, setProviders] = useState<TMDBProvider[]>([]);
  const [cast, setCast] = useState<TMDBCastMember[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Hook para el país del usuario
  const { countryCode, needsSelection, selectCountry } = useCountry();

  // Cargar detalles cuando se abre el modal
  useEffect(() => {
    if (visible && movie && countryCode) {
      loadMovieDetails(movie.id);
    } else if (!visible) {
      // Limpiar estado al cerrar
      setDetails(null);
      setProviders([]);
      setCast([]);
    }
  }, [visible, movie?.id, countryCode]);

  const loadMovieDetails = async (movieId: number) => {
    setLoadingDetails(true);
    try {
      // Cargar detalles, providers y cast en paralelo
      const [detailsData, providersData, creditsData] = await Promise.all([
        getMovieDetails(movieId),
        getMovieWatchProviders(movieId),
        getMovieCredits(movieId),
      ]);

      setDetails(detailsData);

      // Guardar los primeros 10 actores
      if (creditsData.cast) {
        setCast(creditsData.cast.slice(0, 10));
      }

      // Obtener providers para el país del usuario, con fallback a US
      const userCountry = countryCode || "US";
      const countryProviders = providersData.results?.[userCountry] || providersData.results?.US;
      if (countryProviders?.flatrate) {
        setProviders(countryProviders.flatrate);
      } else {
        setProviders([]);
      }
    } catch (error) {
      console.error("Error loading movie details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

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

            {/* Tagline (si existe) */}
            {details?.tagline && (
              <Text className="text-gray-400 italic">{details.tagline}</Text>
            )}

            {/* Año, duración y rating */}
            <View className="flex-row flex-wrap items-center gap-4">
              <View className="flex-row items-center gap-2">
                <Calendar size={16} color="#9ca3af" strokeWidth={2} />
                <Text className="text-gray-400">{releaseYear}</Text>
              </View>

              {details?.runtime && (
                <View className="flex-row items-center gap-2">
                  <Clock size={16} color="#9ca3af" strokeWidth={2} />
                  <Text className="text-gray-400">
                    {formatRuntime(details.runtime)}
                  </Text>
                </View>
              )}

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

            {/* Géneros */}
            {details?.genres && details.genres.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <View
                    key={genre.id}
                    className="bg-gray-800 rounded-full px-3 py-1"
                  >
                    <Text className="text-gray-300 text-sm">{genre.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Loading de detalles */}
            {loadingDetails && (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#22c55e" />
              </View>
            )}

            {/* Providers de streaming */}
            {providers.length > 0 && (
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Tv size={18} color="#22c55e" strokeWidth={2} />
                  <Text className="text-lg font-semibold text-white">
                    Disponible en
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-3">
                  {providers.slice(0, 6).map((provider) => {
                    const logoUrl = getTMDBImageUrl(provider.logo_path, "w92");
                    if (!logoUrl) return null;
                    
                    return (
                      <View
                        key={provider.provider_id}
                        className="items-center gap-1"
                      >
                        <Image
                          source={{ uri: logoUrl }}
                          className="w-12 h-12 rounded-lg"
                          resizeMode="cover"
                        />
                        <Text
                          className="text-gray-400 text-xs text-center max-w-16"
                          numberOfLines={1}
                        >
                          {provider.provider_name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Cast - Actores principales */}
            {cast.length > 0 && (
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Users size={18} color="#3b82f6" strokeWidth={2} />
                  <Text className="text-lg font-semibold text-white">
                    Reparto
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                >
                  {cast.map((actor) => {
                    const profileUrl = getProfileUrl(actor.profile_path);
                    
                    return (
                      <View
                        key={actor.id}
                        className="items-center w-20"
                      >
                        {profileUrl ? (
                          <Image
                            source={{ uri: profileUrl }}
                            className="w-16 h-16 rounded-full bg-gray-800"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-16 h-16 rounded-full bg-gray-800 items-center justify-center">
                            <Users size={24} color="#6b7280" strokeWidth={1.5} />
                          </View>
                        )}
                        <Text
                          className="text-white text-xs text-center mt-2"
                          numberOfLines={2}
                        >
                          {actor.name}
                        </Text>
                        <Text
                          className="text-gray-500 text-xs text-center"
                          numberOfLines={1}
                        >
                          {actor.character}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

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

      {/* Modal de selección de país */}
      <CountryPickerModal
        visible={needsSelection && visible}
        onSelect={selectCountry}
      />
    </Modal>
  );
}
