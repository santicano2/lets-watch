import type {
  TMDBCreditsResponse,
  TMDBMovieDetails,
  TMDBSearchResponse,
  TMDBWatchProvidersResponse,
} from "@/types/tmdb";
import { TMDB_CONFIG } from "./config";

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function getFriendlyErrorMessage(status: number): string {
  if (status === 401 || status === 403) {
    return "No se pudo autenticar con TMDB. Verifica la configuracion de la API.";
  }
  if (status === 404) {
    return "No se encontro el recurso solicitado en TMDB.";
  }
  if (status === 429) {
    return "Demasiadas solicitudes a TMDB. Intenta de nuevo en unos segundos.";
  }
  if (status >= 500) {
    return "TMDB no esta disponible temporalmente. Intenta de nuevo.";
  }
  return "No se pudo completar la solicitud a TMDB.";
}

/**
 * Cliente HTTP base para TMDB API
 */
async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${TMDB_CONFIG.baseUrl}${endpoint}`);

  // Agregar parámetros comunes
  url.searchParams.append("api_key", TMDB_CONFIG.apiKey || "");
  url.searchParams.append("language", TMDB_CONFIG.language);

  // Agregar parámetros adicionales
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        const retriable = isRetriableStatus(response.status);

        if (retriable && attempt < MAX_RETRIES) {
          await sleep(BASE_RETRY_DELAY_MS * attempt);
          continue;
        }

        throw new Error(getFriendlyErrorMessage(response.status));
      }

      return response.json();
    } catch (error) {
      lastError = error as Error;

      // Errores de red (fetch falla antes de tener response)
      const isNetworkError =
        lastError?.message?.toLowerCase().includes("network") ||
        lastError?.message?.toLowerCase().includes("failed to fetch");

      if (isNetworkError && attempt < MAX_RETRIES) {
        await sleep(BASE_RETRY_DELAY_MS * attempt);
        continue;
      }

      break;
    }
  }

  if (lastError) {
    // Si ya tenemos un error amigable, reutilizarlo
    if (
      lastError.message.includes("TMDB") ||
      lastError.message.includes("No se") ||
      lastError.message.includes("Demasiadas")
    ) {
      throw lastError;
    }

    throw new Error(
      "No se pudo conectar con TMDB. Revisa tu conexion e intenta de nuevo.",
    );
  }

  throw new Error("Error inesperado al consultar TMDB.");
}

/**
 * Busca películas por título
 * @param query - Texto de búsqueda
 * @param page - Número de página (default: 1)
 */
export async function searchMovies(
  query: string,
  page: number = 1,
): Promise<TMDBSearchResponse> {
  if (!query.trim()) {
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  return tmdbFetch<TMDBSearchResponse>("/search/movie", {
    query: query.trim(),
    page: page.toString(),
    include_adult: "false",
  });
}

/**
 * Obtiene películas populares
 * @param page - Número de página (default: 1)
 */
export async function getPopularMovies(
  page: number = 1,
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>("/movie/popular", {
    page: page.toString(),
  });
}

/**
 * Obtiene películas que están en cines
 * @param page - Número de página (default: 1)
 */
export async function getNowPlayingMovies(
  page: number = 1,
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>("/movie/now_playing", {
    page: page.toString(),
  });
}

/**
 * Obtiene películas próximas a estrenarse
 * @param page - Número de página (default: 1)
 */
export async function getUpcomingMovies(
  page: number = 1,
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>("/movie/upcoming", {
    page: page.toString(),
  });
}

/**
 * Obtiene detalles completos de una película
 * @param movieId - ID de la película en TMDB
 */
export async function getMovieDetails(
  movieId: number,
): Promise<TMDBMovieDetails> {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${movieId}`);
}

/**
 * Obtiene el cast (actores) y crew (equipo) de una película
 * @param movieId - ID de la película en TMDB
 */
export async function getMovieCredits(
  movieId: number,
): Promise<TMDBCreditsResponse> {
  return tmdbFetch<TMDBCreditsResponse>(`/movie/${movieId}/credits`);
}

/**
 * Obtiene plataformas de streaming disponibles por país
 * @param movieId - ID de la película en TMDB
 */
export async function getMovieWatchProviders(
  movieId: number,
): Promise<TMDBWatchProvidersResponse> {
  return tmdbFetch<TMDBWatchProvidersResponse>(
    `/movie/${movieId}/watch/providers`,
  );
}

/**
 * Obtiene recomendaciones basadas en una película
 * @param movieId - ID de la película en TMDB
 * @param page - Número de página (default: 1)
 */
export async function getMovieRecommendations(
  movieId: number,
  page: number = 1,
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
  page: number = 1,
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>(`/movie/${movieId}/similar`, {
    page: page.toString(),
  });
}
