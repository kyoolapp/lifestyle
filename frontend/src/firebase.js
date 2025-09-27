import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqjocIuNvFimVJwUYpfjEubdYhzieaM7s",
  authDomain: "lifestyle-health-kyool.firebaseapp.com",
  projectId: "lifestyle-health-kyool",
  storageBucket: "lifestyle-health-kyool.appspot.com",
  messagingSenderId: "1084205685608",
  appId: "1:1084205685608:web:79763140c35206316654dd",
  measurementId: "G-M8JFK3C9XC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export { auth };
