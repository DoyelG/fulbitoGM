import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Skip initialization when no apiKey is present so the CI `next build`
// step can statically prerender pages (e.g. /_not-found) without
// NEXT_PUBLIC_FIREBASE_* secrets injected. Real runtime always has them.
const app: FirebaseApp | undefined = firebaseConfig.apiKey
  ? (getApps()[0] ?? initializeApp(firebaseConfig))
  : undefined

export const auth = (app ? getAuth(app) : undefined) as Auth
export const db = (app ? getFirestore(app) : undefined) as Firestore
export const storage = (app ? getStorage(app) : undefined) as FirebaseStorage
