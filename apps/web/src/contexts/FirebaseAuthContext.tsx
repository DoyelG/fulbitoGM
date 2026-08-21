'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  signIn as firebaseSignIn,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  register as firebaseRegister,
  onAuthStateChanged,
  isAdmin as checkIsAdmin,
  type AppUser,
} from '@fulbito/firebase'

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
    const unsub = onAuthStateChanged((appUser) => {
      setUser(appUser)
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = async (email: string, password: string) => {
    const appUser = await firebaseSignIn(email, password)
    setUser(appUser)
  }

  const signInWithGoogle = async () => {
    const appUser = await firebaseSignInWithGoogle()
    setUser(appUser)
  }

  const signOut = async () => {
    await firebaseSignOut()
    setUser(null)
  }

  const register = async (email: string, password: string) => {
    const appUser = await firebaseRegister(email, password)
    setUser(appUser)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin: checkIsAdmin(user), signIn, signInWithGoogle, signOut, register }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useFirebaseAuth must be used inside FirebaseAuthProvider')
  return ctx
}
