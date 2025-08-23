// src/audio/packs.ts
// ❗IMPORTANTE: require() DEBE SER ESTÁTICO (sin variables)
export const PACK_VOWELS = {
  a: require('../../assets/sounds/hiragana/a.mp3'),
  i: require('../../assets/sounds/hiragana/i.mp3'),
  u: require('../../assets/sounds/hiragana/u.mp3'),
  e: require('../../assets/sounds/hiragana/e.mp3'),
  o: require('../../assets/sounds/hiragana/o.mp3'),
};

export type PackName = 'vowels';

export const AUDIO_PACKS: Record<PackName, Record<string, number>> = {
  vowels: PACK_VOWELS,
};
