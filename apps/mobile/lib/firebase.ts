import AsyncStorage from '@react-native-async-storage/async-storage'
import { initFirebase } from '@fulbito/firebase'
import { getApps } from 'firebase/app'
import { getReactNativePersistence, initializeAuth } from 'firebase/auth'
import type { FirebaseOptions } from 'firebase/app'

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

// Initializes the default Firebase app at module load time.
// Imported as a side effect from FirebaseAuthContext and data hooks via _layout.tsx.
const alreadyInitialized = getApps().length > 0
const app = initFirebase(firebaseConfig)

// Must run before any @fulbito/firebase call (e.g. getAuth()) so auth persists
// across app restarts on React Native instead of defaulting to in-memory only.
if (app && !alreadyInitialized) {
  initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
}
