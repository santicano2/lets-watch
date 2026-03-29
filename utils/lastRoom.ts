import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_ROOM_CODE_KEY = "@lets_watch_last_room_code";

export async function saveLastRoomCode(roomCode: string): Promise<void> {
  await AsyncStorage.setItem(LAST_ROOM_CODE_KEY, roomCode.toUpperCase());
}

export async function getLastRoomCode(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_ROOM_CODE_KEY);
}

export async function clearLastRoomCode(): Promise<void> {
  await AsyncStorage.removeItem(LAST_ROOM_CODE_KEY);
}
