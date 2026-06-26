import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBFP9M-Qi_ZcZDWijhp6i4nXNVve3rCiQs",
  authDomain: "daju-3a553.firebaseapp.com",
  projectId: "daju-3a553",
  storageBucket: "daju-3a553.appspot.com",
  messagingSenderId: "819477173036",
  appId: "1:819477173036:web:24b711fe90160c48a4d289",
  measurementId: "G-KQ0EM19GV6"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);