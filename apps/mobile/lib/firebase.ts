import AsyncStorage from '@react-native-async-storage/async-storage'
import { initFirebase } from '@fulbito/firebase'
import { getApps, initializeApp } from 'firebase/app'
import { getReactNativePersistence, initializeAuth } from 'firebase/auth'
import type { FirebaseOptions } from 'firebase/app'
import { Platform } from 'react-native'

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

const emulatorHost =
  process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || (Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1')

if (firebaseConfig.apiKey && getApps().length === 0) {
  initializeAuth(initializeApp(firebaseConfig), {
    persistence: getReactNativePersistence(AsyncStorage),
  })
}

initFirebase(firebaseConfig, {
  emulatorHost: process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true' ? emulatorHost : undefined,
})
