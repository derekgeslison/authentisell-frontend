import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  // Get from Firebase Console > Project Settings > Web App
  apiKey: "YOUR_API_KEY",
  authDomain: "authentisell.firebaseapp.com",
  projectId: "authentisell",
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);