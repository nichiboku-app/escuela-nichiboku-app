// src/services/achievements.ts
import {
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

const USERS = 'Usuarios';
const SUBCOL = 'logros';

export type AchievementPayload = {
  title: string;
  description: string;
  icon: string;
  badgeColor: string;
  points: number; // mismo que xp (por si en algún lado usas "points")
  xp: number;     // se sumará 1 sola vez al usuario
  score: number;
  total: number;
  type: 'quiz' | string;
  quizKey?: string;
  sub?: string;
  version?: number;
  createdAt?: number | Date;
};

/** Lee un logro del usuario actual (o null si no existe) */
export async function getAchievement(achievementId: string) {
  const u = auth.currentUser;
  if (!u) throw new Error('No hay usuario autenticado');

  const ref = doc(db, USERS, u.uid, SUBCOL, achievementId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Crea el logro SOLO si no existe y suma XP exactamente una vez (idempotente).
 * Si ya existe, lanza Error('already-exists').
 */
export async function awardAchievementOnce(
  achievementId: string,
  payload: AchievementPayload
) {
  const u = auth.currentUser;
  if (!u) throw new Error('No hay usuario autenticado');

  const userRef = doc(db, USERS, u.uid);
  const achRef  = doc(db, USERS, u.uid, SUBCOL, achievementId);

  await runTransaction(db, async (tx) => {
    const achSnap = await tx.get(achRef);
    if (achSnap.exists()) {
      throw new Error('already-exists');
    }

    // Crea el documento del logro (sin permitir sobreescrituras posteriores)
    tx.set(achRef, {
      id: achievementId,
      ...payload,
      createdAt: serverTimestamp(),
    });

    // Suma el XP UNA vez
    const xpToAdd = payload.xp ?? payload.points ?? 0;
    if (xpToAdd > 0) {
      tx.set(
        userRef,
        { xp: increment(xpToAdd), updatedAt: serverTimestamp() },
        { merge: true }
      );
    }
  });
}

/** (Opcional) mantén esta firma si en otras partes lo llamas así */
export async function awardAchievement(
  achievementId: string,
  payload: AchievementPayload
) {
  return awardAchievementOnce(achievementId, payload);
}
