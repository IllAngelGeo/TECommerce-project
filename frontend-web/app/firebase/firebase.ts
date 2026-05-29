import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAufFtAkC-c1S4nOkk1IxIHBn8B30a3sK0",
  authDomain: "tecommerce-efde4.firebaseapp.com",
  projectId: "tecommerce-efde4",
  storageBucket: "tecommerce-efde4.firebasestorage.app",
  messagingSenderId: "477383599734",
  appId: "1:477383599734:web:1794b84092f642eb30e157",
  measurementId: "G-WZHYRPM8V2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider =
  new GoogleAuthProvider();

export const loginGoogle = async () => {

  return await signInWithPopup(
    auth,
    googleProvider
  );
};