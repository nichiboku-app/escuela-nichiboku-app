// src/audio/preload.ts
// Pre-carga audios con progreso y evita recargas múltiples.

import { Asset } from 'expo-asset';

// ⚠️ Ajusta las rutas de tus MP3 según tu repo.
// Estas rutas asumen: /assets/sounds/vowels/*.mp3
const VOWELS = [
  require('../../assets/sounds/hiragana/a.mp3'),
  require('../../assets/sounds/hiragana/i.mp3'),
  require('../../assets/sounds/hiragana/u.mp3'),
  require('../../assets/sounds/hiragana/e.mp3'),
  require('../../assets/sounds/hiragana/o.mp3'),
];

export type AudioPackKey = 'vowels';

export const AUDIO_MANIFEST: Record<AudioPackKey, number[]> = {
  vowels: VOWELS,
};

let warmedUp = false;

export async function preloadAudioPacks(
  packs: AudioPackKey[],
  onProgress?: (p: { done: number; total: number; percent: number }) => void
) {
  const files = packs.flatMap(k => AUDIO_MANIFEST[k] ?? []);
  const total = files.length || 1;
  let done = 0;
  const tick = () => onProgress?.({ done, total, percent: Math.round((done / total) * 100) });

  tick();

  // 1) bajar a caché
  for (const mod of files) {
    try {
      const asset = Asset.fromModule(mod);
      if (!asset.downloaded) await asset.downloadAsync();
    } catch {/* continuar aunque 1 falle */}
    finally { done++; tick(); }
  }

  // 2) “warm up” del decodificador (solo 1 vez por app)
  if (!warmedUp) {
    try {
      const { Audio } = await import('expo-av'); // import dinámico
      for (const mod of files) {
        try {
          const s = new Audio.Sound();
          await s.loadAsync(mod, { shouldPlay: false });
          await s.unloadAsync();
        } catch {}
      }
      warmedUp = true;
    } catch { /* si no hay expo-av, seguimos igual */ }
  }
}