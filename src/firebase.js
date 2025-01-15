// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Corrected import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLYJNiVidcG578XXlDUfK4Z5vabLIK55U",
  authDomain: "weather-based-travel-planner.firebaseapp.com",
  projectId: "weather-based-travel-planner",
  storageBucket: "weather-based-travel-planner.firebasestorage.app",
  messagingSenderId: "855438488237",
  appId: "1:855438488237:web:2037b41397e01693834c24",
  measurementId: "G-9Y8SM2ZKKJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app); // Corrected initialization
