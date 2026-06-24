import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA0QAoGKelSzzDfaQkvreXeR-ArtRBIhTQ",
  authDomain: "nava-billing-wa0s8a.firebaseapp.com",
  databaseURL: "https://nava-billing-wa0s8a-default-rtdb.firebaseio.com",
  projectId: "nava-billing-wa0s8a",
  storageBucket: "nava-billing-wa0s8a.firebasestorage.app",
  messagingSenderId: "654287504899",
  appId: "1:654287504899:web:b8b378d27e3ca097a4f036"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;