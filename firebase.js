// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzTFhM3cl3lJ9BnynCfsOcbFkwQ_Nad3M",
  authDomain: "interntask-aec56.firebaseapp.com",
  projectId: "interntask-aec56",
  messagingSenderId: "861178925576",
  appId: "1:861178925576:web:154908e741e743f8e6f7bd",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
