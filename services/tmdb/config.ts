/**
 * Configuración del cliente TMDB
 */

export const TMDB_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_TMDB_API_KEY,
  baseUrl: 'https://api.themoviedb.org/3',
  language: process.env.EXPO_PUBLIC_TMDB_LANGUAGE || 'es-MX',
  imageBaseUrl: 'https://image.tmdb.org/t/p',
};

/**
 * Genera URL completa para imágenes de TMDB
 * @param path - Path de la imagen (ej: "/abc123.jpg")
 * @param size - Tamaño de la imagen (w500, w780, original, etc.)
 */
export function getTMDBImageUrl(
  path: string | null,
  size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string | null {
  if (!path) return null;
  return `${TMDB_CONFIG.imageBaseUrl}/${size}${path}`;
}

/**
 * Genera URL de poster de película
 */
export function getPosterUrl(posterPath: string | null): string | null {
  return getTMDBImageUrl(posterPath, 'w500');
}

/**
 * Genera URL de backdrop (imagen de fondo)
 */
export function getBackdropUrl(backdropPath: string | null): string | null {
  return getTMDBImageUrl(backdropPath, 'w780');
}

/**
 * Genera URL de foto de perfil (actores)
 */
export function getProfileUrl(profilePath: string | null): string | null {
  return getTMDBImageUrl(profilePath, 'w185');
}
