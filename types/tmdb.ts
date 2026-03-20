/**
 * Tipos para la API de TMDB (The Movie Database)
 * Documentación: https://developers.themoviedb.org/3
 */

/**
 * Resultado de búsqueda de película
 */
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  genre_ids: number[];
}

/**
 * Respuesta de búsqueda paginada
 */
export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

/**
 * Detalles completos de una película
 */
export interface TMDBMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  genres: TMDBGenre[];
  budget: number;
  revenue: number;
  status: string;
  tagline: string;
  homepage: string | null;
  imdb_id: string | null;
}

/**
 * Género de película
 */
export interface TMDBGenre {
  id: number;
  name: string;
}

/**
 * Actor/Miembro del cast
 */
export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  cast_id: number;
  credit_id: string;
}

/**
 * Miembro del crew (director, productor, etc.)
 */
export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id: string;
}

/**
 * Respuesta de créditos (actores y crew)
 */
export interface TMDBCreditsResponse {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

/**
 * Plataforma de streaming
 */
export interface TMDBProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

/**
 * Información de streaming por tipo
 */
export interface TMDBWatchProviderInfo {
  link?: string;
  flatrate?: TMDBProvider[]; // Streaming (Netflix, Disney+, etc.)
  rent?: TMDBProvider[]; // Renta
  buy?: TMDBProvider[]; // Compra
}

/**
 * Respuesta de proveedores de streaming por país
 */
export interface TMDBWatchProvidersResponse {
  id: number;
  results: {
    [countryCode: string]: TMDBWatchProviderInfo;
  };
}

/**
 * Configuración de imágenes de TMDB
 */
export interface TMDBImageConfig {
  base_url: string;
  secure_base_url: string;
  backdrop_sizes: string[];
  logo_sizes: string[];
  poster_sizes: string[];
  profile_sizes: string[];
  still_sizes: string[];
}

/**
 * Respuesta de configuración de TMDB
 */
export interface TMDBConfigurationResponse {
  images: TMDBImageConfig;
  change_keys: string[];
}
