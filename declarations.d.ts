// src/types/assets.d.ts

// Imágenes raster (para require/import en React Native)
declare module '*.png'  { const c: import('react-native').ImageSourcePropType; export default c; }
declare module '*.jpg'  { const c: import('react-native').ImageSourcePropType; export default c; }
declare module '*.jpeg' { const c: import('react-native').ImageSourcePropType; export default c; }
declare module '*.gif'  { const c: import('react-native').ImageSourcePropType; export default c; }
declare module '*.webp' { const c: import('react-native').ImageSourcePropType; export default c; }

// SVG como componente (requiere react-native-svg + transformer)
declare module '*.svg' {
  import * as React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// (opcional) audio/video si los usas con require()
declare module '*.mp3' { const c: number; export default c; }
declare module '*.wav' { const c: number; export default c; }
declare module '*.mp4' { const c: number; export default c; }
