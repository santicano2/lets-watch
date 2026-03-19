// Tipos de dominio de la aplicación

export type RoomStatus = 'open' | 'closed';

export interface Room {
  id: string;
  code: string; // 6 caracteres únicos
  name: string;
  hostUserId: string;
  createdAt: Date | string;
  status: RoomStatus;
  participants: string[]; // Array de userIds
}

export interface RoomMovie {
  id: string;
  roomCode: string;
  tmdbId: number; // ID de TMDB
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  addedBy: string; // userId
  addedAt: Date | string;
  upvotes: number;
  downvotes: number;
  netVotes: number; // upvotes - downvotes (para ordenar)
}

export type VoteType = 'up' | 'down';

export interface Vote {
  id: string;
  roomCode: string;
  movieId: string;
  userId: string;
  type: VoteType;
  createdAt: Date | string;
}
