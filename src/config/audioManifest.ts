// src/config/audioManifest.ts
// Agrega aquí TODOS los audios que quieras precargar (usa require para que los incluya el bundle)
export const VOWEL_AUDIO_MODULES = [
  require('../../assets/sounds/hiragana/a.mp3'),
  require('../../assets/sounds/hiragana/i.mp3'),
  require('../../assets/sounds/hiragana/u.mp3'),
  require('../../assets/sounds/hiragana/e.mp3'),
  require('../../assets/sounds/hiragana/o.mp3'),
];

// Si luego tienes más grupos (consonantes, sílabas, etc.), crea y exporta más arrays:
// export const HIRAGANA_KA_ROW = [ require('.../ka.mp3'), require('.../ki.mp3'), ... ];
