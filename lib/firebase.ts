import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Browser config for the web app. These values are public by design (they
// identify the project; access is enforced by firestore.rules and
// storage.rules), so they're safe in the client bundle. Set the
// NEXT_PUBLIC_FIREBASE_* variables to point a deployment at another
// project; otherwise the production project below is used.
const env = process.env;
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyBaU9n0yuuolyPbqdRUUXo3knT4PjNWZCc",
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "vinoji-291fa.firebaseapp.com",
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "vinoji-291fa",
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "vinoji-291fa.firebasestorage.app",
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "723408749142",
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:723408749142:web:5792617b66c87fb92631f7",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
