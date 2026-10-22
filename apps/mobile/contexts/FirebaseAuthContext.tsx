import '@/lib/firebase'

import {
  deleteUser as firebaseDeleteUser,
  register as firebaseRegister,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type AppUser,
} from '@fulbito/firebase'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type AuthContextValue = {
  user: AppUser | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  deleteUser: (password?: string) => Promise<void>
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
    const appUser = await firebaseSignIn(email.trim(), password.trim())
    setUser(appUser)
  }

  const register = async (email: string, password: string) => {
    const appUser = await firebaseRegister(email.trim(), password.trim())
    setUser(appUser)
  }

  const signOut = async () => {
    await firebaseSignOut()
    setUser(null)
  }

  const deleteUser = async () => {
    await firebaseDeleteUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin: user?.role === 'ADMIN', signIn, register, signOut, deleteUser }}
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
