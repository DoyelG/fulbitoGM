import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { AppUser } from '@fulbito/firebase'

async function getUserRole(uid: string): Promise<'USER' | 'ADMIN'> {
  const snap = await getDoc(doc(db, 'users', uid))
  return (snap.data()?.role as 'USER' | 'ADMIN') ?? 'USER'
}

type AuthContextValue = {
  user: AppUser | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = firebaseOnAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) { setUser(null); setLoading(false); return }
      const role = await getUserRole(fbUser.uid)
      setUser({ uid: fbUser.uid, email: fbUser.email!, role })
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const role = await getUserRole(cred.user.uid)
    setUser({ uid: cred.user.uid, email: cred.user.email!, role })
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: user?.role === 'ADMIN', signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useFirebaseAuth must be used inside FirebaseAuthProvider')
  return ctx
}
