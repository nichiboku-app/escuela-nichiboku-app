// src/utils/audioPreloader.ts
import { Asset } from 'expo-asset';
import { InteractionManager } from 'react-native';

export type PreloadProgress = {
  total: number;
  done: number;
  percent: number; // 0..100
};

type Options = {
  // tamaño de lote: cuántos assets se cargan en paralelo (evita bloquear el JS thread)
  batchSize?: number;
  // callback de progreso
  onProgress?: (p: PreloadProgress) => void;
  // si quieres retrasar al final para mostrar 100% por un instante
  settleDelayMs?: number;
};

async function loadAudioLibrary() {
  // 1) primero intentamos expo-audio (nuevo)
  try {
    // @ts-ignore
    const lib = await import('expo-audio');
    // algunas versiones exportan Audio, otras el namespace
    const Audio = (lib as any).Audio ?? lib;
    return { Audio, flavor: 'expo-audio' as const };
  } catch (e1) {
    // 2) fallback a expo-av (deprecado pero compatible)
    // @ts-ignore
    const lib2 = await import('expo-av');
    const { Audio } = lib2 as any;
    return { Audio, flavor: 'expo-av' as const };
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function preloadAudioModules(
  modules: number[], // array de require(...)
  opts: Options = {}
) {
  const batchSize = opts.batchSize ?? 4;
  const onProgress = opts.onProgress ?? (() => {});
  const total = modules.length;
  let done = 0;

  // Espera a que terminen animaciones/gestos antes de empezar (no bloquea navegación)
  await new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(() => resolve());
  });

  // 1) Asegura que los archivos estén disponibles (cache/packager)
  //    Esto NO carga a memoria, solo resuelve el asset.
  await Asset.loadAsync(modules);

  // 2) Carga “ligera” de audio para “calentar” cache
  const { Audio, flavor } = await loadAudioLibrary();

  // Cargamos por lotes
  for (let i = 0; i < modules.length; i += batchSize) {
    const slice = modules.slice(i, i + batchSize);

    await Promise.all(
      slice.map(async (mod) => {
        try {
          const sound = new Audio.Sound();
          // loadAsync sin shouldPlay; y descargamos después para no retener memoria
          await sound.loadAsync(mod, { shouldPlay: false });
          await sound.unloadAsync();
        } catch (err) {
          // no hacemos throw para no cortar toda la precarga
          console.warn('[preload] error loading', err);
        } finally {
          done += 1;
          onProgress({
            total,
            done,
            percent: Math.min(100, Math.round((done / total) * 100)),
          });
        }
      })
    );

    // Pequeño respiro entre lotes para no bloquear el hilo
    await sleep(10);
  }

  if (opts.settleDelayMs) {
    await sleep(opts.settleDelayMs);
  }

  return { flavor, total };
}
