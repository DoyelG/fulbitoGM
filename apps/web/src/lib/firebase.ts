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

// Defer initialization so module import during static prerender (where env
// vars are absent) does not call initializeApp with an empty apiKey.
let _app: FirebaseApp | undefined
let _auth: Auth | undefined
let _db: Firestore | undefined
let _storage: FirebaseStorage | undefined

function ensureApp(): FirebaseApp {
  if (_app) return _app
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  return _app
}

function lazy<T extends object>(factory: () => T): T {
  return new Proxy({} as T, {
    get(_, prop, receiver) {
      return Reflect.get(factory(), prop, receiver)
    },
  })
}

export const auth: Auth = lazy(() => (_auth ??= getAuth(ensureApp())))
export const db: Firestore = lazy(() => (_db ??= getFirestore(ensureApp())))
export const storage: FirebaseStorage = lazy(() => (_storage ??= getStorage(ensureApp())))
