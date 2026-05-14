'use client'

import { FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
}
