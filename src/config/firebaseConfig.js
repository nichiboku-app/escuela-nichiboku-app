// src/config/firebaseConfig.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
    getReactNativePersistence,
    initializeAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbJi5h4-YnWZ5Nq0_QGf0W-IhLCdnKyHM",
  authDomain: "escuelanichiboku.firebaseapp.com",
  projectId: "escuelanichiboku",
  storageBucket: "escuelanichiboku.appspot.com",
  messagingSenderId: "134897542862",
  appId: "1:134897542862:web:f779ed6c5b16bea386d29f"
};

const app = initializeApp(firebaseConfig);

// Persistencia con AsyncStorage para React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };

