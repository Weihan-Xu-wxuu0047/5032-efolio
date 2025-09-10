import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDCz8UYFPq8z2DfHi2mJ26y1QrBCgFTbSU",
  authDomain: "assingment1-community-sport.firebaseapp.com",
  projectId: "assingment1-community-sport",
  storageBucket: "assingment1-community-sport.firebasestorage.app",
  messagingSenderId: "716321854345",
  appId: "1:716321854345:web:da05e36411e3605593c758"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
