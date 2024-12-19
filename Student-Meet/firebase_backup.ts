import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD8c9MI7RwTnPNx6bDtSthdk2bvg75X32o",
  authDomain: "studentmeet-9e802.firebaseapp.com",
  projectId: "studentmeet-9e802",
  storageBucket: "studentmeet-9e802.appspot.com",
  messagingSenderId: "134322719793",
  appId: "1:134322719793:web:3cf5d31165ec592e2a9910",
  measurementId: "G-GTB3J91G3H",
  databaseURL: "https://studentmeet-9e802-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const dbRealtime = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, dbRealtime, auth };