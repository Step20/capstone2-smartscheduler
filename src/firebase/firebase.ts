// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBlfLDdvBjHI5ovlaJS19N0ZA2vuGUC3UM",
    authDomain: "capstone2-cis.firebaseapp.com",
    projectId: "capstone2-cis",
    storageBucket: "capstone2-cis.firebasestorage.app",
    messagingSenderId: "631922975648",
    appId: "1:631922975648:web:43e12892d291b0a5543ac5",
    measurementId: "G-NGZ2TV91E4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // <-- export Firestore instance

const analytics = getAnalytics(app);