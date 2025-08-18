// app.config.js
require("dotenv").config();

module.exports = {
  expo: {
    name: "EscuelaNichiboku",
    slug: "escuela-nichiboku-app",
    extra: {
      firebase: {
     apiKey: "AIzaSyAbJi5h4-YnWZ5Nq0_QGf0W-IhLCdnKyHM",
  authDomain: "escuelanichiboku.firebaseapp.com",
  projectId: "escuelanichiboku",
  storageBucket: "escuelanichiboku.firebasestorage.app",
  messagingSenderId: "134897542862",
  appId: "1:134897542862:web:f779ed6c5b16bea386d29f"
      },
    },
  },
};
