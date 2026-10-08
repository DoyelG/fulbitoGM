import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import type { Role } from '@fulbito/types'

export type AppUser = {
  uid: string
  email: string
  role: Role[]
}

async function getUserRoles(uid: string): Promise<Role[]> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'users', uid))
  const role = snap.data()?.role
  if (!role) return ['USER']
  return Array.isArray(role) ? role : [role]
}

async function ensureUserDoc(uid: string, email: string): Promise<void> {
  const db = getFirestore()
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    const now = Timestamp.now()
    await setDoc(userRef, { email, role: ['USER'], createdAt: now, updatedAt: now })
  }
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  const auth = getAuth()
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const role = await getUserRoles(cred.user.uid)
  return { uid: cred.user.uid, email: cred.user.email!, role }
}

export async function register(email: string, password: string): Promise<AppUser> {
  const auth = getAuth()
  const db = getFirestore()
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  const now = Timestamp.now()
  await setDoc(doc(db, 'users', cred.user.uid), {
    email,
    role: ['USER'],
    createdAt: now,
    updatedAt: now,
  })
  return { uid: cred.user.uid, email, role: ['USER'] }
}

export async function signInWithGoogle(): Promise<AppUser> {
  const auth = getAuth()
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  const uid = cred.user.uid
  const email = cred.user.email!

  await ensureUserDoc(uid, email)
  const role = await getUserRoles(uid)
  return { uid, email, role }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuth())
}

export function onAuthStateChanged(callback: (user: AppUser | null) => void): () => void {
  const auth = getAuth()
  return firebaseOnAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null)
      return
    }
    const role = await getUserRoles(firebaseUser.uid)
    callback({ uid: firebaseUser.uid, email: firebaseUser.email!, role })
  })
}

export function isAdmin(user: AppUser | null): boolean {
  return user?.role.includes('ADMIN') ?? false
}
