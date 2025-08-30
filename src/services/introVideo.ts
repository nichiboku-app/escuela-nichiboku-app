// src/services/introVideo.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { app } from '../config/firebaseConfig';

const INTRO_VIDEO_KEY = 'intro_video_seen_v1';

// Forzar bucket (igual al de la consola)
const storageIntro = getStorage(app, 'gs://escuelanichiboku.firebasestorage.app');

export async function getIntroVideoUrl(): Promise<string> {
  const r = ref(storageIntro, 'intro/intro_bunkan.mp4');
  return getDownloadURL(r);
}

export async function wasIntroVideoSeen() {
  try { return (await AsyncStorage.getItem(INTRO_VIDEO_KEY)) === '1'; } catch { return false; }
}
export async function markIntroVideoSeen() {
  try { await AsyncStorage.setItem(INTRO_VIDEO_KEY, '1'); } catch {}
}
export async function resetIntroVideoSeen() {
  try { await AsyncStorage.removeItem(INTRO_VIDEO_KEY); } catch {}
}
