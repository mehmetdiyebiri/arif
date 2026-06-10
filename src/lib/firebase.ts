import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDVZHrDnPfCZhy2kv_PU2XHqW-1b2fqqgo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gihosistem.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gihosistem",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gihosistem.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "826788368080",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:826788368080:web:a17f652d5379b9335458d5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E3RHM9GBMB"
};

export const app = initializeApp(firebaseConfig);
export const analytics = firebaseConfig.measurementId ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
