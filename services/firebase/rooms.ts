import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';
import { Room, RoomStatus } from '@/types/domain';
import { generateRoomCode } from '@/utils/roomCode';

const ROOMS_COLLECTION = 'rooms';

/**
 * Crea una nueva sala de votación
 * Genera un código único de 6 caracteres
 */
export async function createRoom(creatorName: string): Promise<Room> {
  // Generar código único (verificar que no exista)
  let roomCode: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    roomCode = generateRoomCode();
    const existingRoom = await getDoc(doc(db, ROOMS_COLLECTION, roomCode));
    if (!existingRoom.exists()) break;
    attempts++;
  } while (attempts < maxAttempts);

  if (attempts === maxAttempts) {
    throw new Error('No se pudo generar un código único de sala');
  }

  const room: Room = {
    code: roomCode,
    creatorName,
    status: 'voting',
    createdAt: new Date(),
    participantCount: 1,
  };

  // Guardar en Firestore (usar código como document ID)
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  await setDoc(roomRef, {
    ...room,
    createdAt: serverTimestamp(),
  });

  return room;
}

/**
 * Obtiene una sala por su código
 */
export async function getRoomByCode(code: string): Promise<Room | null> {
  const roomRef = doc(db, ROOMS_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    return null;
  }

  const data = roomSnap.data();
  return {
    code: roomSnap.id,
    creatorName: data.creatorName,
    status: data.status,
    createdAt: data.createdAt?.toDate() || new Date(),
    participantCount: data.participantCount,
    selectedMovieId: data.selectedMovieId,
  };
}

/**
 * Actualiza el estado de una sala
 */
export async function updateRoomStatus(
  code: string,
  status: RoomStatus
): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, code);
  await updateDoc(roomRef, { status });
}

/**
 * Cierra la votación y selecciona una película ganadora
 */
export async function closeVoting(
  code: string,
  selectedMovieId: number
): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, code);
  await updateDoc(roomRef, {
    status: 'closed',
    selectedMovieId,
  });
}

/**
 * Incrementa el contador de participantes en una sala
 */
export async function incrementParticipantCount(code: string): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);
  
  if (roomSnap.exists()) {
    const currentCount = roomSnap.data().participantCount || 0;
    await updateDoc(roomRef, {
      participantCount: currentCount + 1,
    });
  }
}

/**
 * Elimina una sala (solo para el creador o administración)
 */
export async function deleteRoom(code: string): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, code);
  await deleteDoc(roomRef);
}
