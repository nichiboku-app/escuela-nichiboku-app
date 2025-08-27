import { doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

/**
 * Registra un logro para el usuario actual.
 * - Crea/actualiza doc en: Usuarios/{uid}/logros/{achievementId}
 * - Incrementa XP en Usuarios/{uid}.xp si envías xp>0
 */
export async function awardAchievement(achievementId: string, opts?: { sub?: string; xp?: number }) {
  const u = auth.currentUser;
  if (!u) throw new Error('No hay usuario autenticado');

  const { sub, xp } = opts || {};

  // Subcolección de logros (idempotente por achievementId)
  await setDoc(
    doc(db, 'Usuarios', u.uid, 'logros', achievementId),
    {
      id: achievementId,
      sub: sub ?? '',
      unlockedAt: serverTimestamp(),
      times: increment(1),
    },
    { merge: true }
  );

  // Sumar XP (opcional)
  if (typeof xp === 'number' && xp > 0) {
    await setDoc(
      doc(db, 'Usuarios', u.uid),
      {
        xp: increment(xp),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}
