import {
  getFirestore, collection, doc,
  getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp,
} from 'firebase/firestore'
import type { Player } from '@fulbito/types'

// Duck-typed rather than `instanceof Timestamp`: this is also called with documents
// read via the `firebase/firestore/lite` SDK (see server.ts), whose `Timestamp` class
// is a distinct instance from this file's import, so `instanceof` would silently fail.
function isTimestampLike(value: unknown): value is { toDate(): Date } {
  return typeof value === 'object' && value !== null && typeof (value as { toDate?: unknown }).toDate === 'function'
}

export function docToPlayer(id: string, data: Record<string, any>): Player {
  return {
    id,
    name: data.name,
    position: data.position,
    skill: data.skill ?? null,
    skills: data.skills,
    photoUrl: data.photoUrl,
    goalkeeping: data.goalkeeping ?? undefined,
    createdAt: isTimestampLike(data.createdAt) ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: isTimestampLike(data.updatedAt) ? data.updatedAt.toDate() : new Date(data.updatedAt),
  }
}

export async function getPlayers(): Promise<Player[]> {
  const db = getFirestore()
  const snap = await getDocs(query(collection(db, 'players'), orderBy('skill', 'desc')))
  return snap.docs.map(d => docToPlayer(d.id, d.data()))
}

export async function getPlayer(id: string): Promise<Player | null> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'players', id))
  return snap.exists() ? docToPlayer(snap.id, snap.data()) : null
}

export async function createPlayer(data: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = getFirestore()
  const ref = await addDoc(collection(db, 'players'), {
    name: data.name,
    position: data.position,
    skill: data.skill ?? null,
    skills: data.skills ?? null,
    photoUrl: data.photoUrl ?? null,
    goalkeeping: data.goalkeeping ?? null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return ref.id
}

export async function updatePlayer(id: string, data: Partial<Omit<Player, 'id' | 'createdAt'>>): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'players', id), { ...data, updatedAt: Timestamp.now() })
}

export async function deletePlayer(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'players', id))
}
