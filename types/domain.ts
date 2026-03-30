/**
 * Tipos de dominio de la aplicación
 * Estructura de datos para Firebase Firestore
 */

export type RoomStatus = "voting" | "closed";

/** Opciones de duración en minutos */
export type RoomDuration = 15 | 30 | 60 | 120;

export interface Room {
  code: string; // 6 caracteres únicos (usado como document ID)
  creatorName: string;
  creatorId: string; // userId del creador
  status: RoomStatus;
  createdAt: Date;
  endsAt: Date; // Timestamp cuando termina la votación
  duration: RoomDuration; // Duración en minutos
  participantCount: number;
  selectedMovieId?: number; // TMDB ID de la película ganadora
  isTieBreak?: boolean;
  tieBreakMovieIds?: number[];
}

export interface Participant {
  userId: string; // ID anónimo del usuario
  name: string;
  joinedAt: Date;
  isCreator: boolean;
  isReady: boolean; // Para FASE 10: indica si terminó de votar
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

export type VoteType = "upvote" | "downvote";

export interface Vote {
  roomCode: string;
  movieId: number; // TMDB ID
  userId: string;
  voteType: VoteType;
  votedAt: Date;
}
