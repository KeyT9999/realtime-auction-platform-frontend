import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || "";
const explicitAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || "";
const explicitStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || "";

const derivedAuthDomain = projectId ? `${projectId}.firebaseapp.com` : "";
const derivedStorageBucket = projectId ? `${projectId}.firebasestorage.app` : "";

const authDomain = projectId && explicitAuthDomain && explicitAuthDomain.includes(projectId)
  ? explicitAuthDomain
  : (derivedAuthDomain || explicitAuthDomain);

const storageBucket = projectId && explicitStorageBucket && explicitStorageBucket.includes(projectId)
  ? explicitStorageBucket
  : (derivedStorageBucket || explicitStorageBucket);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const firebaseDiagnostics = {
  projectId,
  authDomain,
  storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId || "",
  appId: firebaseConfig.appId || "",
  measurementId: firebaseConfig.measurementId || "",
  hasApiKey: Boolean(firebaseConfig.apiKey),
};

if (typeof window !== "undefined" && projectId) {
  if (explicitAuthDomain && explicitAuthDomain !== authDomain) {
    console.warn("Firebase authDomain does not match VITE_FIREBASE_PROJECT_ID. Using inferred authDomain instead.");
  }

  if (explicitStorageBucket && explicitStorageBucket !== storageBucket) {
    console.warn("Firebase storageBucket does not match VITE_FIREBASE_PROJECT_ID. Using inferred storageBucket instead.");
  }
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
let analytics = null;

if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Firebase analytics is unavailable in this environment.", error);
  }
}

export { db, storage, analytics, auth, firebaseDiagnostics };
