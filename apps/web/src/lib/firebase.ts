import { initFirebase } from '@fulbito/firebase'
import type { FirebaseOptions } from 'firebase/app'

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initializes the default Firebase app at module load time.
// Returns undefined when apiKey is absent (e.g. Next.js static prerender in CI).
// All @fulbito/firebase functions use lazy getAuth()/getFirestore()/getStorage() so
// they will resolve against this app once it is set.
initFirebase(firebaseConfig)
