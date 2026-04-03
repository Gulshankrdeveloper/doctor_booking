import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDo6uU8UnqEJqVQbI_DVerf4dqhLL1N-AQ",
  authDomain: "nexhealth-74403.firebaseapp.com",
  projectId: "nexhealth-74403",
  storageBucket: "nexhealth-74403.firebasestorage.app",
  messagingSenderId: "454662779225",
  appId: "1:454662779225:web:7e3756c74c246008ed5c48"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
