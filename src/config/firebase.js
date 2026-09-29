import { getApp, getApps, initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlQjLr2AlhkpkxosChOql2etlAiKJnZNY",
  authDomain: "achadidos-15d82.firebaseapp.com",
  projectId: "achadidos-15d82",
  storageBucket: "achadidos-15d82.firebasestorage.app",
  messagingSenderId: "301093505148",
  appId: "1:301093505148:web:c994dc09f8b003d569e1f9",
  measurementId: "G-QQGY1GK01C"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;
