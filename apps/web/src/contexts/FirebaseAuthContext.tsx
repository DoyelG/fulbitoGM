'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
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
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  register: (email: string, password: string) => Promise<void>
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

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider())
    const uid = cred.user.uid
    const email = cred.user.email!
    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) {
      await setDoc(userRef, { email, role: 'USER', createdAt: Timestamp.now() })
    }
    const role = (snap.data()?.role as 'USER' | 'ADMIN') ?? 'USER'
    setUser({ uid, email, role })
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
  }

  const register = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      role: 'USER',
      createdAt: Timestamp.now(),
    })
    setUser({ uid: cred.user.uid, email, role: 'USER' })
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: user?.role === 'ADMIN', signIn, signInWithGoogle, signOut, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useFirebaseAuth must be used inside FirebaseAuthProvider')
  return ctx
}
