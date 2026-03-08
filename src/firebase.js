const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let _app = null;
let _db = null;
let _auth = null;
let _analytics = null;

async function getApp() {
  if (!_app) {
    const { initializeApp } = await import('firebase/app');
    _app = initializeApp(firebaseConfig);
  }
  return _app;
}

export async function getDb() {
  if (!_db) {
    const app = await getApp();
    const { getFirestore } = await import('firebase/firestore');
    _db = getFirestore(app);
  }
  return _db;
}

export async function getAuth() {
  if (!_auth) {
    const app = await getApp();
    const { getAuth: _getAuth } = await import('firebase/auth');
    _auth = _getAuth(app);
  }
  return _auth;
}

export async function getAnalytics() {
  if (!_analytics) {
    const app = await getApp();
    const { getAnalytics: _getAnalytics } = await import('firebase/analytics');
    _analytics = _getAnalytics(app);
  }
  return _analytics;
}
