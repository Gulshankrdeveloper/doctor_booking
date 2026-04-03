import { auth, db } from './firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { navigateTo } from './main.js';

export const authService = {
  // Current user's role cached locally after successful database query
  currentRole: localStorage.getItem('nexhealth_role') || null,

  isAuthenticated: () => {
    return auth.currentUser !== null || localStorage.getItem('nexhealth_role') !== null;
  },

  getRole: () => {
    return localStorage.getItem('nexhealth_role');
  },

  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch role from Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const role = docSnap.data().role;
        localStorage.setItem('nexhealth_role', role);
        return role;
      } else {
        throw new Error("User data not found in database.");
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      throw error;
    }
  },

  registerPatient: async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save identity mapping to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: 'patient'
      });

      localStorage.setItem('nexhealth_role', 'patient');
      return 'patient';
    } catch (error) {
      console.error("Patient registration failed:", error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('nexhealth_role');
      navigateTo('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
};

// Exporting fakeAuth map to authService to maintain backward compatibility with routing structure!
export const fakeAuth = authService;
