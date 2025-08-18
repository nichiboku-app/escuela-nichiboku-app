import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

// Devuelve un data URL si hay base64 en Firestore; si no, usa photoURL de auth
export function getAvatarUri(userDoc?: any): string | null {
  const b64: string | undefined = userDoc?.photoBase64;
  if (b64 && b64.length > 10) return `data:image/jpeg;base64,${b64}`;
  return auth.currentUser?.photoURL ?? null;
}

/**
 * Abre la galería, recorta a 1:1, comprime y guarda el base64 en
 * Firestore: Usuarios/{uid}.  Sin blobs.  Devuelve un data URL para
 * refrescar la UI inmediatamente.
 */
export async function pickAndSaveAvatar(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay usuario autenticado');

  // Permisos
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permiso de galería denegado');
  }

  // Selección
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.9,          // calidad fuente
    base64: false,         // base64 lo generamos tras comprimir
  });
  if (res.canceled) return null;

  const asset = res.assets?.[0];
  if (!asset?.uri) return null;

  // ⚙️ Comprime + genera base64 (sin blobs)
  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: 600 } }], // ~600px lado mayor
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  const b64 = manipulated.base64;
  if (!b64) throw new Error('No se pudo leer la imagen seleccionada');

  // Guarda en Firestore (colección correcta: "Usuarios")
  const refDoc = doc(db, 'Usuarios', user.uid);
  await setDoc(
    refDoc,
    { photoBase64: b64, avatarUpdatedAt: Date.now() },
    { merge: true }
  );

  // Devuelve data URL para refrescar avatar en pantalla
  return `data:image/jpeg;base64,${b64}`;
}
