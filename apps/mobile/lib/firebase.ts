import AsyncStorage from '@react-native-async-storage/async-storage'
import { initializeApp, getApps } from 'firebase/app'
import { getReactNativePersistence, initializeAuth, getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

const alreadyInitialized = getApps().length > 0
const app = alreadyInitialized ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = alreadyInitialized
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
export const db = getFirestore(app)
export const storage = getStorage(app)
