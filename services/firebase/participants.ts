import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { Participant } from '@/types/domain';

/**
 * Obtiene la referencia a la subcolección de participantes de una sala
 */
function getParticipantsCollection(roomCode: string) {
  return collection(db, 'rooms', roomCode, 'participants');
}

/**
 * Agrega un participante a una sala
 * El userId se usa como document ID para evitar duplicados
 */
export async function addParticipant(
  roomCode: string,
  userId: string,
  name: string,
  isCreator: boolean = false
): Promise<Participant> {
  const participantsCol = getParticipantsCollection(roomCode);
  const participantRef = doc(participantsCol, userId);

  // Verificar si ya existe (evitar duplicados)
  const existing = await getDoc(participantRef);
  if (existing.exists()) {
    // Ya está registrado, retornar el existente
    const data = existing.data();
    return {
      userId: existing.id,
      name: data.name,
      joinedAt: new Date(data.joinedAt),
      isCreator: data.isCreator,
    };
  }

  const participant: Participant = {
    userId,
    name,
    joinedAt: new Date(),
    isCreator,
  };

  await setDoc(participantRef, {
    ...participant,
    joinedAt: new Date().toISOString(),
  });

  return participant;
}

/**
 * Obtiene todos los participantes de una sala
 */
export async function getParticipants(roomCode: string): Promise<Participant[]> {
  const participantsCol = getParticipantsCollection(roomCode);
  const q = query(participantsCol, orderBy('joinedAt', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      userId: doc.id,
      name: data.name,
      joinedAt: new Date(data.joinedAt),
      isCreator: data.isCreator,
    };
  });
}

/**
 * Obtiene un participante específico
 */
export async function getParticipant(
  roomCode: string,
  userId: string
): Promise<Participant | null> {
  const participantsCol = getParticipantsCollection(roomCode);
  const participantRef = doc(participantsCol, userId);
  const participantSnap = await getDoc(participantRef);

  if (!participantSnap.exists()) {
    return null;
  }

  const data = participantSnap.data();
  return {
    userId: participantSnap.id,
    name: data.name,
    joinedAt: new Date(data.joinedAt),
    isCreator: data.isCreator,
  };
}

/**
 * Suscripción en tiempo real a los participantes de una sala
 * Retorna una función para cancelar la suscripción
 */
export function subscribeToParticipants(
  roomCode: string,
  onParticipantsChange: (participants: Participant[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const participantsCol = getParticipantsCollection(roomCode);
  const q = query(participantsCol, orderBy('joinedAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const participants = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          userId: doc.id,
          name: data.name,
          joinedAt: new Date(data.joinedAt),
          isCreator: data.isCreator,
        } as Participant;
      });
      onParticipantsChange(participants);
    },
    (error) => {
      console.error('Error in participants subscription:', error);
      onError?.(error);
    }
  );
}
