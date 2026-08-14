'use client'

// Side-effect import: runs initFirebase before any @fulbito/firebase calls in this tree
import '@/lib/firebase'
import { FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
}
