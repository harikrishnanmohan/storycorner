import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIxAGgXD5PfoxNFakRqvIqZyY9UmG71D4",
  authDomain: "storycorner-30cf4.firebaseapp.com",
  projectId: "storycorner-30cf4",
  storageBucket: "storycorner-30cf4.appspot.com",
  messagingSenderId: "273132527834",
  appId: "1:273132527834:web:6e96e9f916b52cad8785e3",
  measurementId: "G-XQ1J4HM0L7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const fireStore = getFirestore(app);

export default app;
