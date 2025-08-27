// src/services/progress.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'last_location';

export async function rememberLocation(routeName: string) {
  try {
    await AsyncStorage.setItem(KEY, routeName);
  } catch {}
}

export async function getLastLocation(): Promise<string | null> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v ?? null;
  } catch {
    return null;
  }
}

export async function clearLastLocation() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
