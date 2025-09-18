// src/strokes/hiraganaM_strokes.ts
// 🔴 NOTA: Estos d son MEJORAS respecto a los anteriores, pero lo IDEAL es reemplazarlos
// por los que generes desde AnimCJK con el script (ver más abajo). Así quedarán 1:1.

export const HIRAGANA_M_STROKES = {
  // ま (3)
  ma: [
    // 1) barra superior ligeramente curvada
    "M18 26 C38 22, 62 22, 82 26",
    // 2) trazo vertical con pequeño gancho a la derecha
    "M44 24 C46 45, 46 64, 44 78 C52 76, 58 72, 62 66",
    // 3) bucle derecho (gota)
    "M58 50 C72 44, 80 60, 70 70 C60 80, 46 72, 56 58",
  ],

  // み (3)
  mi: [
    // 1) curva alta
    "M20 34 C42 24, 68 24, 82 32",
    // 2) ondulación media
    "M30 48 C44 58, 62 58, 74 50",
    // 3) curva baja con caída (simula el remate)
    "M22 64 C40 82, 70 84, 84 64",
  ],

  // む (3)
  mu: [
    // 1) barra superior
    "M16 34 L84 34",
    // 2) mitad izquierda de la gota
    "M50 34 C30 48, 30 66, 50 78",
    // 3) mitad derecha de la gota
    "M50 78 C70 66, 70 48, 50 34",
  ],

  // め (3)
  me: [
    // 1) barra superior
    "M20 28 L80 28",
    // 2) columna con retorno (forma básica de め)
    "M36 28 C36 56, 66 56, 66 28",
    // 3) arrastre inferior
    "M28 60 C48 80, 70 80, 84 64",
  ],

  // も (3)
  mo: [
    // 1) barra superior
    "M18 28 L82 28",
    // 2) vertical principal (ligera curva)
    "M52 24 C50 44, 50 64, 52 82",
    // 3) barra media
    "M30 56 L72 56",
  ],
} as const;
