import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (prevent duplicate init)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with explicit persistence
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
});

// Initialize Firestore
export const firestore = getFirestore(app);

// Initialize Analytics (browser check)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
