// src/game/useProgress.ts
import { useEffect, useState } from 'react';
import { loadStats, loadUserAchievements } from './progress.store';

export function useProgress() {
  const [stats, setStats] = useState<{ xp: number; level: number }>({ xp: 0, level: 1 });
  const [ach, setAch] = useState<{ id: string; unlockedAt: string; times?: number }[]>([]);

  async function refresh() {
    const [s, a] = await Promise.all([loadStats(), loadUserAchievements()]);
    setStats(s); setAch(a);
  }

  useEffect(() => { refresh(); }, []);
  return { stats, achievements: ach, refresh };
}
