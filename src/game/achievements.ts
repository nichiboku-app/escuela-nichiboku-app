// src/game/achievements.ts
export type Achievement = {
  id: string;
  title: string;
  xp: number;
  icon: any;        // require(...) o uri
  repeatable?: boolean; // por defecto false
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'forja_destino',
    title: 'forja tu destino',
    xp: 10,
    icon: require('../../assets/images/mapache_n5.webp'),
  },
  // añade más aquí...
];

export const byId = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));
