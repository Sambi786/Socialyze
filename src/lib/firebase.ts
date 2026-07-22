import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "lucid-tomorrow-fcf5x",
  appId: "1:709364982261:web:19832b2f5bef9a946d40bc",
  apiKey: "AIzaSyBtFy8Ltwy5bOqgjbKYTAB-uI98joJRNWw",
  authDomain: "lucid-tomorrow-fcf5x.firebaseapp.com",
  storageBucket: "lucid-tomorrow-fcf5x.firebasestorage.app",
  messagingSenderId: "709364982261",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-socialyze-70f5baed-44f0-44bc-82b9-5ff0a1b663b8");
export const auth = getAuth(app);
