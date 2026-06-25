import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyClmaSf4tS2IwwxEA6-P5rP1oFV0lcejP8",
    authDomain: "system-achadidos.firebaseapp.com",
    projectId: "system-achadidos",
    storageBucket: "system-achadidos.firebasestorage.app",
    messagingSenderId: "925834809565",
    appId: "1:925834809565:web:5f512471307ffe678b4b34",
    measurementId: "G-FLTWN00TXZ",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export default app;
