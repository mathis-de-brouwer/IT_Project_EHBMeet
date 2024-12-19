// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage"; // Added for Firebase Storage if needed

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8c9MI7RwTnPNx6bDtSthdk2bvg75X32o",
  authDomain: "studentmeet-9e802.firebaseapp.com",
  projectId: "studentmeet-9e802",
  storageBucket: "studentmeet-9e802.appspot.com", // Corrected storage bucket URL
  messagingSenderId: "134322719793",
  appId: "1:134322719793:web:3cf5d31165ec592e2a9910",
  measurementId: "G-GTB3J91G3H",
  databaseURL: "https://studentmeet-9e802-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and other services
const db = getFirestore(app);
const dbRealtime = getDatabase(app);
const storage = getStorage(app);

// Initialize Auth with persistence, but handle possible re-initialization
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
}

export { db, dbRealtime, auth, storage };
