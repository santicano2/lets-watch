import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { RoomMovie } from '@/types/domain';

/**
 * Obtiene la referencia a la subcolección de películas de una sala
 */
function getMoviesCollection(roomCode: string) {
  return collection(db, 'rooms', roomCode, 'movies');
}

/**
 * Agrega una película a una sala
 * El ID de la película de TMDB se usa como document ID
 */
export async function addMovieToRoom(
  roomCode: string,
  movie: {
    id: number;
    title: string;
    posterPath: string | null;
    releaseDate: string;
    overview: string;
  },
  addedBy: string
): Promise<RoomMovie> {
  const moviesCol = getMoviesCollection(roomCode);
  const movieRef = doc(moviesCol, movie.id.toString());

  // Verificar si ya existe
  const existingMovie = await getDoc(movieRef);
  if (existingMovie.exists()) {
    throw new Error('Esta película ya fue agregada a la sala');
  }

  const roomMovie: RoomMovie = {
    id: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    releaseDate: movie.releaseDate,
    overview: movie.overview,
    addedBy,
    addedAt: new Date(),
    upvotes: 0,
    downvotes: 0,
    score: 0,
  };

  await setDoc(movieRef, {
    ...roomMovie,
    addedAt: new Date().toISOString(), // Firestore timestamp
  });

  return roomMovie;
}

/**
 * Obtiene todas las películas de una sala ordenadas por score
 */
export async function getMoviesInRoom(roomCode: string): Promise<RoomMovie[]> {
  const moviesCol = getMoviesCollection(roomCode);
  const q = query(moviesCol, orderBy('score', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: data.id,
      title: data.title,
      posterPath: data.posterPath,
      releaseDate: data.releaseDate,
      overview: data.overview,
      addedBy: data.addedBy,
      addedAt: new Date(data.addedAt),
      upvotes: data.upvotes,
      downvotes: data.downvotes,
      score: data.score,
    };
  });
}

/**
 * Obtiene una película específica de una sala
 */
export async function getMovieInRoom(
  roomCode: string,
  movieId: number
): Promise<RoomMovie | null> {
  const moviesCol = getMoviesCollection(roomCode);
  const movieRef = doc(moviesCol, movieId.toString());
  const movieSnap = await getDoc(movieRef);

  if (!movieSnap.exists()) {
    return null;
  }

  const data = movieSnap.data();
  return {
    id: data.id,
    title: data.title,
    posterPath: data.posterPath,
    releaseDate: data.releaseDate,
    overview: data.overview,
    addedBy: data.addedBy,
    addedAt: new Date(data.addedAt),
    upvotes: data.upvotes,
    downvotes: data.downvotes,
    score: data.score,
  };
}

/**
 * Elimina una película de una sala
 */
export async function removeMovieFromRoom(
  roomCode: string,
  movieId: number
): Promise<void> {
  const moviesCol = getMoviesCollection(roomCode);
  const movieRef = doc(moviesCol, movieId.toString());
  await deleteDoc(movieRef);
}

/**
 * Actualiza los contadores de votos de una película
 * Esta función es llamada desde votes.ts después de procesar un voto
 */
export async function updateMovieVotes(
  roomCode: string,
  movieId: number,
  upvotes: number,
  downvotes: number
): Promise<void> {
  const moviesCol = getMoviesCollection(roomCode);
  const movieRef = doc(moviesCol, movieId.toString());
  
  const score = upvotes - downvotes;
  
  await setDoc(
    movieRef,
    {
      upvotes,
      downvotes,
      score,
    },
    { merge: true }
  );
}

/**
 * Suscripción en tiempo real a las películas de una sala
 * Retorna una función para cancelar la suscripción
 */
export function subscribeToMovies(
  roomCode: string,
  onMoviesChange: (movies: RoomMovie[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const moviesCol = getMoviesCollection(roomCode);
  const q = query(moviesCol, orderBy('score', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const movies = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data.id,
          title: data.title,
          posterPath: data.posterPath,
          releaseDate: data.releaseDate,
          overview: data.overview,
          addedBy: data.addedBy,
          addedAt: new Date(data.addedAt),
          upvotes: data.upvotes,
          downvotes: data.downvotes,
          score: data.score,
        } as RoomMovie;
      });
      onMoviesChange(movies);
    },
    (error) => {
      console.error('Error in movies subscription:', error);
      onError?.(error);
    }
  );
}
