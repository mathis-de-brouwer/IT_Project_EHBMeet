import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { initializeAuth, getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id",
  databaseURL: "your-database-url"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const dbRealtime = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, dbRealtime, auth }; 