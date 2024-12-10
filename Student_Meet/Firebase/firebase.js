// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtIXsLQ3dTfiq3Ad8zUxzOUAZhsMXXk1g",
  authDomain: "student-meetehb.firebaseapp.com",
  projectId: "student-meetehb",
  storageBucket: "student-meetehb.firebasestorage.app",
  messagingSenderId: "50930744515",
  appId: "1:50930744515:web:595e8e922b4d65aebeb676"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export {firebase};