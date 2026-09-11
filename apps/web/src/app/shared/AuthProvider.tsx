'use client'

import '@/lib/firebase'
import { FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
}
