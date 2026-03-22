/**
 * Tipos de dominio de la aplicación
 * Estructura de datos para Firebase Firestore
 */

export type RoomStatus = 'voting' | 'closed';

export interface Room {
  code: string; // 6 caracteres únicos (usado como document ID)
  creatorName: string;
  status: RoomStatus;
  createdAt: Date;
  participantCount: number;
  selectedMovieId?: number; // TMDB ID de la película ganadora
}

export interface RoomMovie {
  id: number; // TMDB ID (usado como document ID en subcollection)
  title: string;
  posterPath: string | null;
  releaseDate: string;
  overview: string;
  addedBy: string; // userId
  addedAt: Date;
  upvotes: number;
  downvotes: number;
  score: number; // upvotes - downvotes (para ordenar)
}

export type VoteType = 'upvote' | 'downvote';

export interface Vote {
  roomCode: string;
  movieId: number; // TMDB ID
  userId: string;
  voteType: VoteType;
  votedAt: Date;
}
