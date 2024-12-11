import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // For Firestore
import { getDatabase } from "firebase/database";   // For Realtime Database

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDVptpwROrukKhNvyZJv6dDbUF-npF-RwI",
    authDomain: "it-project-9cc32.firebaseapp.com",
    projectId: "it-project-9cc32",
    storageBucket: "it-project-9cc32.firebasestorage.app",
    messagingSenderId: "376922205130",
    appId: "1:376922205130:web:443db7d11829518a077d33",
    measurementId: "G-YE54FXEVG5"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the database instances
export const db = getFirestore(app);       // Firestore
export const realtimeDB = getDatabase(app); // Realtime Database
