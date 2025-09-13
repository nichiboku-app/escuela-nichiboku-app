// app.config.js
require("dotenv").config();

/**
 * Nota Firebase:
 * - Corrige "authDoMain" -> "authDomain".
 * - El bucket de Storage normalmente es "<project-id>.appspot.com".
 *   Si tu consola muestra otro, cámbialo aquí.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAbJi5h4-YnWZ5Nq0_QGf0W-IhLCdnKyHM",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "escuelanichiboku.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "escuelanichiboku",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "escuelanichiboku.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "134897542862",
  appId: process.env.FIREBASE_APP_ID || "1:134897542862:web:f779ed6c5b16bea386d29f",
};

module.exports = {
  expo: {
    name: "Escuela Nichiboku",
    slug: "escuela-nichiboku-app",
    scheme: "nichiboku", // para deep links (expo-router / auth redirects)
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",

    ios: {
      bundleIdentifier: "com.nichiboku.app",
      supportsTablet: true,
    },

    android: {
      package: "com.nichiboku.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      // Edge-to-edge está siempre activo en SDK 54
      navigationBar: {
        visible: "leanback", // opcional
      },
      // predictiveBackGestureEnabled: true, // activa si quieres probarlo
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    extra: {
      firebase: firebaseConfig,
    },

    plugins: [
      "expo-router",
      "expo-font",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },
  },
};
