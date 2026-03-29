import { Room, RoomDuration, RoomStatus } from "@/types/domain";
import { generateRoomCode } from "@/utils/roomCode";
import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";

const ROOMS_COLLECTION = "rooms";

interface CreateRoomParams {
  creatorName: string;
  creatorId: string;
  duration: RoomDuration;
}

/**
 * Crea una nueva sala de votación
 * Genera un código único de 6 caracteres
 */
export async function createRoom({
  creatorName,
  creatorId,
  duration,
}: CreateRoomParams): Promise<Room> {
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
    throw new Error("No se pudo generar un código único de sala");
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + duration * 60 * 1000);

  const room: Room = {
    code: roomCode,
    creatorName,
    creatorId,
    status: "voting",
    createdAt: now,
    endsAt,
    duration,
    participantCount: 1,
  };

  // Guardar en Firestore (usar código como document ID)
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  await setDoc(roomRef, {
    ...room,
    createdAt: serverTimestamp(),
    endsAt: endsAt.toISOString(),
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
    creatorId: data.creatorId || "",
    status: data.status,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
    endsAt: data.endsAt ? new Date(data.endsAt) : new Date(),
    duration: data.duration || 30,
    participantCount: data.participantCount,
    selectedMovieId: data.selectedMovieId,
  };
}

/**
 * Suscripción en tiempo real a una sala
 */
export function subscribeToRoom(
  code: string,
  onRoomChange: (room: Room | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const roomRef = doc(db, ROOMS_COLLECTION, code);

  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onRoomChange(null);
        return;
      }

      const data = snapshot.data();
      const room: Room = {
        code: snapshot.id,
        creatorName: data.creatorName,
        creatorId: data.creatorId || "",
        status: data.status,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : new Date(),
        duration: data.duration || 30,
        participantCount: data.participantCount,
        selectedMovieId: data.selectedMovieId,
      };
      onRoomChange(room);
    },
    (error) => {
      console.error("Error in room subscription:", error);
      onError?.(error);
    },
  );
}

/**
 * Actualiza el estado de una sala
 */
export async function updateRoomStatus(
  code: string,
  status: RoomStatus,
): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, code);
  await updateDoc(roomRef, { status });
}

/**
 * Cierra la votación y selecciona una película ganadora
 */
export async function closeVoting(
  code: string,
  selectedMovieId?: number,
): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, code);
  await updateDoc(roomRef, {
    status: "closed",
    ...(selectedMovieId && { selectedMovieId }),
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
