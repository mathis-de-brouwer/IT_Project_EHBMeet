// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8c9MI7RwTnPNx6bDtSthdk2bvg75X32o",
  authDomain: "studentmeet-9e802.firebaseapp.com",
  projectId: "studentmeet-9e802",
  storageBucket: "studentmeet-9e802.firebasestorage.app",
  messagingSenderId: "134322719793",
  appId: "1:134322719793:web:3cf5d31165ec592e2a9910",
  measurementId: "G-GTB3J91G3H",
  databaseURL: "https://studentmeet-9e802-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const dbRealtime = getDatabase(app);
const auth = getAuth(app);

export {db, dbRealtime, auth};