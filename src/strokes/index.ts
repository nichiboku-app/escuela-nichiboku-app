// ========= src/strokes/index.ts =========

// Habilita "resolveJsonModule": true en tsconfig.json (ver paso 2)
import a from "./a.json";
import e from "./e.json";
import i from "./i.json";
import o from "./o.json";
import u from "./u.json";

export type KanaStroke = {
  id: number;
  path: string;
  desc?: string;
  width?: number;
};

export type KanaData = {
  character: string;
  viewBox: string; // "0 0 100 100"
  strokes: KanaStroke[];
};

// Carga estática 100% compatible con Metro (sin require())
export const kanaFiles = {
  a: () => a,
  i: () => i,
  u: () => u,
  e: () => e,
  o: () => o,
} as const;

export type KanaKey = keyof typeof kanaFiles;
