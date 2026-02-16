import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBXvGj30oVj04gnbCSu7hcoMeczVxFNlw0",
  authDomain: "webdaugia-e8a1a.firebaseapp.com",
  projectId: "webdaugia-e8a1a",
  storageBucket: "webdaugia-e8a1a.firebasestorage.app",
  messagingSenderId: "382450013855",
  appId: "1:382450013855:web:438819ac74e0994c8f74aa",
  measurementId: "G-H1NTWFWN5S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, analytics, auth };
