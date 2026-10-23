import type { Role } from '@fulbito/types'
import {
  createUserWithEmailAndPassword,
  deleteUser as firebaseDeleteUser,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
  getAuth,
  GoogleAuthProvider,
  reauthenticateWithPopup,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth'
import { deleteDoc, doc, getDoc, getFirestore, setDoc, Timestamp } from 'firebase/firestore'

export type AppUser = {
  uid: string
  email: string
  role: Role[]
  linkedPlayerId?: string
}

async function getUserProfile(uid: string): Promise<Pick<AppUser, 'role' | 'linkedPlayerId'>> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'users', uid))
  const { role, linkedPlayerId } = snap.data() ?? {}
  return {
    role: !role ? ['USER'] : Array.isArray(role) ? role : [role],
    linkedPlayerId: linkedPlayerId ?? undefined,
  }
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
  const profile = await getUserProfile(cred.user.uid)
  return { uid: cred.user.uid, email: cred.user.email!, ...profile }
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
  const profile = await getUserProfile(uid)
  return { uid, email, ...profile }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuth())
}

export async function deleteUser(): Promise<void> {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) throw new Error('No hay un usuario autenticado')

  if (user.providerData.some((p) => p.providerId === 'google.com')) {
    await reauthenticateWithPopup(user, new GoogleAuthProvider())
  }

  await deleteDoc(doc(getFirestore(), 'users', user.uid))
  await firebaseDeleteUser(user)
}

export function onAuthStateChanged(callback: (user: AppUser | null) => void): () => void {
  const auth = getAuth()
  return firebaseOnAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null)
      return
    }
    const profile = await getUserProfile(firebaseUser.uid)
    callback({ uid: firebaseUser.uid, email: firebaseUser.email!, ...profile })
  })
}

export function isAdmin(user: AppUser | null): boolean {
  return user?.role.includes('ADMIN') ?? false
}
