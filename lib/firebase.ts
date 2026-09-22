import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBaU9n0yuuolyPbqdRUUXo3knT4PjNWZCc",
  authDomain: "vinoji-291fa.firebaseapp.com",
  databaseURL:
    "https://vinoji-291fa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vinoji-291fa",
  storageBucket: "vinoji-291fa.firebasestorage.app",
  messagingSenderId: "723408749142",
  appId: "1:723408749142:web:5792617b66c87fb92631f7",
  measurementId: "G-ED3TR4DF1V",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
