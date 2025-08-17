import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

// Compatibilidad con SDKs nuevos y antiguos del picker
function mediaImages() {
  const ip: any = ImagePicker as any;
  return ip.MediaType ? [ip.MediaType.Images] : ip.MediaTypeOptions.Images;
}

export async function pickAndSaveAvatar(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) throw new Error('Debes iniciar sesión.');

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (perm.status !== 'granted') throw new Error('Permiso de galería denegado.');

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: mediaImages(),
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  } as any);

  if (res.canceled || !res.assets?.length) return null;

  const asset = res.assets[0];

  // Redimensiona y saca base64 (SIN Blob/ArrayBuffer/Storage)
  const out = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: 512 } }], // ~150–250KB
    { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!out.base64) throw new Error('No se pudo convertir la imagen.');

  // Guarda solo en Firestore (NO tocar Auth.photoURL)
  await setDoc(
    doc(db, 'Usuarios', user.uid),
    { photoBase64: out.base64, avatarUpdatedAt: Date.now() },
    { merge: true }
  );

  // Devuelve un data URL para refrescar la UI inmediatamente
  return `data:image/jpeg;base64,${out.base64}`;
}
