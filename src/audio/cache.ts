// src/audio/cache.ts
export type AudioCacheMap = Record<string, string>; // key -> localUri

class AudioCache {
  private map: AudioCacheMap = {};

  set(key: string, localUri: string) {
    this.map[key] = localUri;
  }

  get(key: string) {
    return this.map[key];
  }

  has(key: string) {
    return key in this.map;
  }

  entries() {
    return { ...this.map };
  }

  clear() {
    this.map = {};
  }
}

export const audioCache = new AudioCache();
