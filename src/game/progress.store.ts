// src/game/progress.store.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { byId } from './achievements';

export type UserStats = { xp: number; level: number };
export type UserAchievement = { id: string; unlockedAt: string; times?: number };

const K_STATS = 'stats';
const K_ACH   = 'achievements';

export async function loadStats(): Promise<UserStats> {
  const raw = await AsyncStorage.getItem(K_STATS);
  return raw ? JSON.parse(raw) : { xp: 0, level: 1 };
}

export async function loadUserAchievements(): Promise<UserAchievement[]> {
  const raw = await AsyncStorage.getItem(K_ACH);
  return raw ? JSON.parse(raw) : [];
}

function levelFromXP(xp: number) {
  // nivel sencillo: cada 100 xp sube 1
  return Math.floor(xp / 100) + 1;
}

export async function awardAchievement(id: string) {
  const ach = byId[id];
  if (!ach) return { ok: false, reason: 'unknown_achievement' };

  const [stats, unlocked] = await Promise.all([loadStats(), loadUserAchievements()]);
  const existing = unlocked.find(u => u.id === id);

  if (existing && !ach.repeatable) {
    return { ok: false, reason: 'already_unlocked' };
  }

  // aplica XP
  const newXP = stats.xp + ach.xp;
  const newStats = { xp: newXP, level: levelFromXP(newXP) };

  // registra logro
  let newUnlocked = unlocked;
  if (existing) {
    existing.times = (existing.times ?? 1) + 1;
    existing.unlockedAt = new Date().toISOString();
  } else {
    newUnlocked = [...unlocked, { id, unlockedAt: new Date().toISOString(), times: 1 }];
  }

  await Promise.all([
    AsyncStorage.setItem(K_STATS, JSON.stringify(newStats)),
    AsyncStorage.setItem(K_ACH, JSON.stringify(newUnlocked)),
  ]);

  return { ok: true, stats: newStats };
}

export async function resetProgress() {
  await Promise.all([AsyncStorage.removeItem(K_STATS), AsyncStorage.removeItem(K_ACH)]);
}
