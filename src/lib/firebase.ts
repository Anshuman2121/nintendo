import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    browserLocalPersistence,
    setPersistence
} from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required config
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
for (const key of requiredKeys) {
    if (!firebaseConfig[key]) {
        console.warn(`Missing Firebase config: ${key}`);
    }
}

// Initialize Firebase - singleton pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with persistence
const auth = getAuth(app);

// Set persistence to local (survives browser restarts)
if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.warn('Failed to set auth persistence:', error);
    });
}

// Configure Google Auth Provider with best practices
const googleProvider = new GoogleAuthProvider();

// Request additional scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Force account selection on each sign-in (prevents cached selection issues)
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export { app, auth, googleProvider };
