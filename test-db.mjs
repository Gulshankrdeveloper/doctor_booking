import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDo6uU8UnqEJqVQbI_DVerf4dqhLL1N-AQ",
  authDomain: "nexhealth-74403.firebaseapp.com",
  projectId: "nexhealth-74403",
  storageBucket: "nexhealth-74403.firebasestorage.app",
  messagingSenderId: "454662779225",
  appId: "1:454662779225:web:7e3756c74c246008ed5c48"
};

async function testConnection() {
  console.log('1. Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('2. Trying to write to Firestore...');
  try {
    await setDoc(doc(db, 'test-collection', 'test-doc'), {
      status: 'connected',
      time: new Date().toISOString()
    });
    console.log('✅ SUCCESS! Wrote to Firestore normally.');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR Writing to Firestore:', error);
    process.exit(1);
  }
}

testConnection();
