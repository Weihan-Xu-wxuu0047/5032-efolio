
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAkHSPr_NtPtfrRXnvr_VcYgtnIQ9sE_gE",
  authDomain: "fit5032-week6-6852d.firebaseapp.com",
  projectId: "fit5032-week6-6852d",
  storageBucket: "fit5032-week6-6852d.firebasestorage.app",
  messagingSenderId: "115678977871",
  appId: "1:115678977871:web:658c067b8cdac5f3922f3a"
};

initializeApp(firebaseConfig)
const db = getFirestore();
export default db;