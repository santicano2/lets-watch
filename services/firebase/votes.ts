import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { Vote, VoteType } from '@/types/domain';
import { updateMovieVotes } from './movies';

const VOTES_COLLECTION = 'votes';

/**
 * Genera un ID único para un voto: {roomCode}_{movieId}_{userId}
 */
function getVoteId(roomCode: string, movieId: number, userId: string): string {
  return `${roomCode}_${movieId}_${userId}`;
}

/**
 * Registra o actualiza el voto de un usuario en una película
 * Lógica:
 * - Si no existe voto previo: crea nuevo voto
 * - Si existe el mismo voto: lo elimina (toggle off)
 * - Si existe voto diferente: lo actualiza
 */
export async function castVote(
  roomCode: string,
  movieId: number,
  userId: string,
  voteType: VoteType
): Promise<void> {
  const voteId = getVoteId(roomCode, movieId, userId);
  const voteRef = doc(db, VOTES_COLLECTION, voteId);
  const voteSnap = await getDoc(voteRef);

  const existingVote = voteSnap.exists() ? (voteSnap.data() as Vote) : null;

  // Si el usuario ya votó lo mismo, eliminar el voto (toggle off)
  if (existingVote && existingVote.voteType === voteType) {
    await deleteDoc(voteRef);
  } else {
    // Crear o actualizar el voto
    const vote: Vote = {
      roomCode,
      movieId,
      userId,
      voteType,
      votedAt: new Date(),
    };

    await setDoc(voteRef, {
      ...vote,
      votedAt: new Date().toISOString(),
    });
  }

  // Recalcular totales de votos para la película
  await recalculateMovieVotes(roomCode, movieId);
}

/**
 * Obtiene el voto de un usuario específico en una película
 */
export async function getUserVote(
  roomCode: string,
  movieId: number,
  userId: string
): Promise<Vote | null> {
  const voteId = getVoteId(roomCode, movieId, userId);
  const voteRef = doc(db, VOTES_COLLECTION, voteId);
  const voteSnap = await getDoc(voteRef);

  if (!voteSnap.exists()) {
    return null;
  }

  const data = voteSnap.data();
  return {
    roomCode: data.roomCode,
    movieId: data.movieId,
    userId: data.userId,
    voteType: data.voteType,
    votedAt: new Date(data.votedAt),
  };
}

/**
 * Obtiene todos los votos de un usuario en una sala
 */
export async function getUserVotesInRoom(
  roomCode: string,
  userId: string
): Promise<Vote[]> {
  const votesCol = collection(db, VOTES_COLLECTION);
  const q = query(
    votesCol,
    where('roomCode', '==', roomCode),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      roomCode: data.roomCode,
      movieId: data.movieId,
      userId: data.userId,
      voteType: data.voteType,
      votedAt: new Date(data.votedAt),
    };
  });
}

/**
 * Recalcula los totales de votos para una película específica
 * Cuenta todos los upvotes y downvotes y actualiza la película
 */
async function recalculateMovieVotes(
  roomCode: string,
  movieId: number
): Promise<void> {
  const votesCol = collection(db, VOTES_COLLECTION);
  const q = query(
    votesCol,
    where('roomCode', '==', roomCode),
    where('movieId', '==', movieId)
  );
  const snapshot = await getDocs(q);

  let upvotes = 0;
  let downvotes = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.voteType === 'upvote') {
      upvotes++;
    } else if (data.voteType === 'downvote') {
      downvotes++;
    }
  });

  // Actualizar la película con los nuevos totales
  await updateMovieVotes(roomCode, movieId, upvotes, downvotes);
}

/**
 * Elimina todos los votos de una sala (útil al cerrar/eliminar sala)
 */
export async function deleteAllVotesInRoom(roomCode: string): Promise<void> {
  const votesCol = collection(db, VOTES_COLLECTION);
  const q = query(votesCol, where('roomCode', '==', roomCode));
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
