// src/assets/audio/kanaAudio.ts
export const kanaAudio = {
  a:  require('../../../assets/sounds/hiragana/a.mp3'),
  i:  require('../../../assets/sounds/hiragana/i.mp3'),
  u:  require('../../../assets/sounds/hiragana/u.mp3'),
  e:  require('../../../assets/sounds/hiragana/e.mp3'),
  o:  require('../../../assets/sounds/hiragana/o.mp3'),
  ka: require('../../../assets/sounds/hiragana/ka.mp3'),
  ki: require('../../../assets/sounds/hiragana/ki.mp3'),
  ku: require('../../../assets/sounds/hiragana/ku.mp3'),
  ke: require('../../../assets/sounds/hiragana/ke.mp3'),
  ko: require('../../../assets/sounds/hiragana/ko.mp3'),
} as const;

export type KanaKey = keyof typeof kanaAudio;

/** Pool tipado para actividades (key, label y src listo para expo-av) */
export const KANA_POOL: { key: KanaKey; label: string; src: number }[] =
  (Object.entries(kanaAudio) as [KanaKey, number][])
    .map(([key, src]) => ({ key, label: key, src }));

/** Lista de claves disponible (por si la necesitas) */
export const kanaKeys: KanaKey[] = Object.keys(kanaAudio) as KanaKey[];
