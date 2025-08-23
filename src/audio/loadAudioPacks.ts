// src/audio/loadAudioPacks.ts
import { Asset } from 'expo-asset';
import { audioCache } from './cache';
import { AUDIO_PACKS, PackName } from './packs';

function nowMs() {
  // @ts-ignore
  return (globalThis?.performance?.now?.() as number | undefined) ?? Date.now();
}

export async function loadAudioPacks(packs: PackName[], debug = true) {
  const t0 = nowMs();
  if (debug) console.log('[loadAudioPacks] start packs =', packs);

  const assets: Asset[] = [];

  for (const pack of packs) {
    const files = AUDIO_PACKS[pack];                 // Record<string, number>
    const keys = Object.keys(files);

    for (const key of keys) {
      const moduleId = files[key];                   // number (require id)
      const cacheKey = `${pack}:${key}`;

      if (audioCache.has(cacheKey)) {
        if (debug) console.log(`[loadAudioPacks] cache HIT ${cacheKey}`);
        continue;
      }

      const asset = Asset.fromModule(moduleId);      // -> Asset
      assets.push(asset);
    }
  }

  const t1 = nowMs();
  if (assets.length) {
    if (debug) console.log(`[loadAudioPacks] downloading ${assets.length} assets…`);
    // ✅ Descarga cada asset respetando los tipos de tu SDK
    await Promise.all(assets.map(a => a.downloadAsync()));
  } else {
    if (debug) console.log('[loadAudioPacks] nothing to download (all cached)');
  }
  const t2 = nowMs();

  // Escribe en caché las URIs locales
  for (const pack of packs) {
    const files = AUDIO_PACKS[pack];
    const keys = Object.keys(files);
    for (const key of keys) {
      const moduleId = files[key];
      const asset = Asset.fromModule(moduleId);
      const localUri = asset.localUri ?? asset.uri;  // fallback
      const cacheKey = `${pack}:${key}`;
      if (localUri) audioCache.set(cacheKey, localUri);
    }
  }
  const t3 = nowMs();

  if (debug) {
    console.log(`[loadAudioPacks] ⏱ prepare=${Math.round(t1 - t0)}ms download=${Math.round(t2 - t1)}ms cacheWrite=${Math.round(t3 - t2)}ms total=${Math.round(t3 - t0)}ms`);
    console.log('[loadAudioPacks] cache entries =', audioCache.entries());
  }
}
