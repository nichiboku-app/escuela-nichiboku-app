// src/services/uploadAvatar.ts
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadString } from "firebase/storage";
import { auth, db } from "../config/firebaseConfig";

const USER_COLLECTION = "Usuarios"; // cambia a "users" cuando unifiques

function mediaImages() {
  const ip: any = ImagePicker as any;
  return ip.MediaType ? [ip.MediaType.Images] : ImagePicker.MediaTypeOptions.Images;
}

export async function pickAndSaveAvatar(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) throw new Error("Debes iniciar sesión.");

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (perm.status !== "granted") throw new Error("Permiso de galería denegado.");

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: mediaImages(),
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  } as any);

  if (res.canceled || !res.assets?.length) return null;

  const out = await ImageManipulator.manipulateAsync(
    res.assets[0].uri,
    [{ resize: { width: 512 } }],
    { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  if (!out.base64) throw new Error("No se pudo convertir la imagen.");

  const storage = getStorage();
  const version = Date.now();
  const fileRef = ref(storage, `users/${user.uid}/avatar_${version}.jpg`);
  await uploadString(fileRef, out.base64, "base64", { contentType: "image/jpeg" });

  const url = await getDownloadURL(fileRef);

  await setDoc(
    doc(db, USER_COLLECTION, user.uid),
    { photoURL: url, avatarUpdatedAt: serverTimestamp() },
    { merge: true }
  );

  return `${url}?t=${version}`; // evita caché
}

export function getAvatarUri(userDoc?: any): string | null {
  if (!userDoc) return null;
  if (typeof userDoc.photoURL === "string" && userDoc.photoURL) return userDoc.photoURL;
  if (typeof userDoc.photoBase64 === "string" && userDoc.photoBase64)
    return `data:image/jpeg;base64,${userDoc.photoBase64}`;
  return null;
}
