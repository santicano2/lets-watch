import { TMDB_CONFIG } from './config';
import type {
  TMDBSearchResponse,
  TMDBMovieDetails,
  TMDBCreditsResponse,
  TMDBWatchProvidersResponse,
} from '@/types/tmdb';

/**
 * Cliente HTTP base para TMDB API
 */
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_CONFIG.baseUrl}${endpoint}`);
  
  // Agregar parámetros comunes
  url.searchParams.append('api_key', TMDB_CONFIG.apiKey || '');
  url.searchParams.append('language', TMDB_CONFIG.language);
  
  // Agregar parámetros adicionales
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca películas por título
 * @param query - Texto de búsqueda
 * @param page - Número de página (default: 1)
 */
export async function searchMovies(query: string, page: number = 1): Promise<TMDBSearchResponse> {
  if (!query.trim()) {
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  return tmdbFetch<TMDBSearchResponse>('/search/movie', {
    query: query.trim(),
    page: page.toString(),
    include_adult: 'false',
  });
}

/**
 * Obtiene películas populares
 * @param page - Número de página (default: 1)
 */
export async function getPopularMovies(page: number = 1): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>('/movie/popular', {
    page: page.toString(),
  });
}

/**
 * Obtiene películas que están en cines
 * @param page - Número de página (default: 1)
 */
export async function getNowPlayingMovies(page: number = 1): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>('/movie/now_playing', {
    page: page.toString(),
  });
}

/**
 * Obtiene películas próximas a estrenarse
 * @param page - Número de página (default: 1)
 */
export async function getUpcomingMovies(page: number = 1): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>('/movie/upcoming', {
    page: page.toString(),
  });
}

/**
 * Obtiene detalles completos de una película
 * @param movieId - ID de la película en TMDB
 */
export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${movieId}`);
}

/**
 * Obtiene el cast (actores) y crew (equipo) de una película
 * @param movieId - ID de la película en TMDB
 */
export async function getMovieCredits(movieId: number): Promise<TMDBCreditsResponse> {
  return tmdbFetch<TMDBCreditsResponse>(`/movie/${movieId}/credits`);
}

/**
 * Obtiene plataformas de streaming disponibles por país
 * @param movieId - ID de la película en TMDB
 */
export async function getMovieWatchProviders(movieId: number): Promise<TMDBWatchProvidersResponse> {
  return tmdbFetch<TMDBWatchProvidersResponse>(`/movie/${movieId}/watch/providers`);
}

/**
 * Obtiene recomendaciones basadas en una película
 * @param movieId - ID de la película en TMDB
 * @param page - Número de página (default: 1)
 */
export async function getMovieRecommendations(
  movieId: number,
  page: number = 1
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>(`/movie/${movieId}/recommendations`, {
    page: page.toString(),
  });
}

/**
 * Obtiene películas similares a una dada
 * @param movieId - ID de la película en TMDB
 * @param page - Número de página (default: 1)
 */
export async function getSimilarMovies(
  movieId: number,
  page: number = 1
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>(`/movie/${movieId}/similar`, {
    page: page.toString(),
  });
}
