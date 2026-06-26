import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClmaSf4tS2IwwxEA6-P5rP1oFV0lcejP8",
  authDomain: "system-achadidos.firebaseapp.com",
  projectId: "system-achadidos",
  messagingSenderId: "925834809565",
  appId: "1:925834809565:web:5f512471307ffe678b4b34",
  measurementId: "G-FLTWN00TXZ",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
