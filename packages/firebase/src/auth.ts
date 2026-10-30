import type { Role } from '@fulbito/types'
import { normalizeRoles } from './roles'
import {
  createUserWithEmailAndPassword,
  deleteUser as firebaseDeleteUser,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
  getAuth,
  GoogleAuthProvider,
  reauthenticateWithPopup,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth'
import { deleteDoc, doc, getDoc, getFirestore, setDoc, Timestamp, updateDoc } from 'firebase/firestore'

export type AppUser = {
  uid: string
  email: string
  emailVerified: boolean
  role: Role[]
  linkedPlayerId?: string
}

async function getUserProfile(uid: string): Promise<Pick<AppUser, 'role' | 'linkedPlayerId'>> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'users', uid))
  const { role, linkedPlayerId } = snap.data() ?? {}
  return {
    role: normalizeRoles(role),
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
  return { uid: cred.user.uid, email: cred.user.email!, emailVerified: cred.user.emailVerified, ...profile }
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
  // Registration must not fail because the email could not be sent; the user can resend it later.
  await sendEmailVerification(cred.user).catch(() => undefined)
  return { uid: cred.user.uid, email, emailVerified: false, role: ['USER'] }
}

export async function signInWithGoogle(): Promise<AppUser> {
  const auth = getAuth()
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  const uid = cred.user.uid
  const email = cred.user.email!

  await ensureUserDoc(uid, email)
  const profile = await getUserProfile(uid)
  return { uid, email, emailVerified: cred.user.emailVerified, ...profile }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuth())
}

const RECENT_LOGIN_WINDOW_IN_MS = 5 * 60 * 1000

export async function deleteUser(): Promise<void> {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) throw new Error('No hay un usuario autenticado')

  if (user.providerData.some((p) => p.providerId === 'google.com')) {
    await reauthenticateWithPopup(user, new GoogleAuthProvider())
  } else if (Date.now() - Date.parse(user.metadata.lastSignInTime ?? '') > RECENT_LOGIN_WINDOW_IN_MS) {
    throw new Error('Volvé a iniciar sesión para eliminar tu cuenta')
  }

  const db = getFirestore()
  const { linkedPlayerId } = await getUserProfile(user.uid)
  if (linkedPlayerId) {
    const playerRef = doc(db, 'players', linkedPlayerId)
    if ((await getDoc(playerRef)).exists()) {
      await updateDoc(playerRef, { linkedUserId: null, updatedAt: Timestamp.now() })
    }
  }

  await deleteDoc(doc(db, 'users', user.uid))
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
    callback({
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      emailVerified: firebaseUser.emailVerified,
      ...profile,
    })
  })
}

export async function resendVerificationEmail(): Promise<void> {
  const user = getAuth().currentUser
  if (!user) throw new Error('No hay un usuario autenticado')
  await sendEmailVerification(user)
}

export async function reloadCurrentUser(): Promise<AppUser | null> {
  const user = getAuth().currentUser
  if (!user) return null
  await user.reload()
  // Security rules read email_verified from the ID token, so it has to be reissued after verifying.
  await user.getIdToken(true)
  const profile = await getUserProfile(user.uid)
  return { uid: user.uid, email: user.email!, emailVerified: user.emailVerified, ...profile }
}

export function isAdmin(user: AppUser | null): boolean {
  return user?.role.includes('ADMIN') ?? false
}
