// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
<<<<<<< Updated upstream
import { getAuth } from 'firebase/auth';
=======
import { getAuth } from "firebase/auth"; // Added for Firebase Authentication
import { getStorage } from "firebase/storage"; // Added for Firebase Storage if needed
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
const db = getFirestore(app);
const dbRealtime = getDatabase(app);
const auth = getAuth(app);

export {db, dbRealtime, auth};
=======
const db = getFirestore(app); // Firestore database
const dbRealtime = getDatabase(app); // Realtime database
const auth = getAuth(app); // Firebase authentication
const storage = getStorage(app); // Firebase storage

export { db, dbRealtime, auth, storage };
>>>>>>> Stashed changes
