import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import type { Player } from '@fulbito/types'

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate()
  const parsed = new Date(value as string)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

// Firestore docs are unvalidated (rules only check auth), so every field gets a
// runtime-honest default here rather than in every consumer: createPlayer writes
// null for absent optionals, and legacy docs may lack fields or hold wrong types.
function docToPlayer(id: string, data: Record<string, unknown>): Player {
  return {
    id,
    name: typeof data['name'] === 'string' ? data['name'] : '',
    position: typeof data['position'] === 'string' ? data['position'] : '',
    skill: (data['skill'] as number | null) ?? null,
    skills: (data['skills'] as Player['skills'] | null) ?? undefined,
    photoUrl: (data['photoUrl'] as string | null) ?? undefined,
    goalkeeping: (data['goalkeeping'] as number | null) ?? undefined,
    createdAt: toDate(data['createdAt']),
    updatedAt: toDate(data['updatedAt']),
  }
}

export async function getPlayers(): Promise<Player[]> {
  const db = getFirestore()
  // Sorted client-side: a Firestore orderBy('skill') would silently drop docs
  // that lack the skill field entirely (legacy/hand-created players).
  const snap = await getDocs(collection(db, 'players'))
  return snap.docs
    .map((d) => docToPlayer(d.id, d.data()))
    .sort((a, b) => (b.skill ?? -Infinity) - (a.skill ?? -Infinity))
}

export async function getPlayer(id: string): Promise<Player | null> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'players', id))
  return snap.exists() ? docToPlayer(snap.id, snap.data()) : null
}

export async function createPlayer(data: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!data.name.trim()) throw new Error('Player name is required')
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
