import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import type { Player } from '@fulbito/types'

function isTimestampLike(value: unknown): value is { toDate(): Date } {
  return typeof value === 'object' && value !== null && typeof (value as { toDate?: unknown }).toDate === 'function'
}

function toDate(value: unknown): Date {
  if (isTimestampLike(value)) return value.toDate()
  const parsed = new Date(value as string)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

export const PLAYERS_COLLECTION = 'players'

export type PlayerInput = Omit<Player, 'id' | 'tournamentId' | 'createdAt' | 'updatedAt'>

export function docToPlayer(id: string, data: Record<string, unknown>): Player {
  return {
    id,
    tournamentId: typeof data['tournamentId'] === 'string' ? data['tournamentId'] : '',
    name: typeof data['name'] === 'string' ? data['name'] : '',
    position: typeof data['position'] === 'string' ? data['position'] : '',
    skill: (data['skill'] as number | null) ?? null,
    skills: (data['skills'] as Player['skills'] | null) ?? undefined,
    photoUrl: (data['photoUrl'] as string | null) ?? undefined,
    inactive: (data['inactive'] as boolean | null) ?? false,
    goalkeeping: (data['goalkeeping'] as number | null) ?? undefined,
    linkedUserId: (data['linkedUserId'] as string | null) ?? undefined,
    createdAt: toDate(data['createdAt']),
    updatedAt: toDate(data['updatedAt']),
  }
}

export function tournamentPlayersQuery(tournamentId: string) {
  return query(collection(getFirestore(), PLAYERS_COLLECTION), where('tournamentId', '==', tournamentId))
}

export async function getPlayers(tournamentId: string): Promise<Player[]> {
  const snap = await getDocs(tournamentPlayersQuery(tournamentId))
  return snap.docs
    .map((d) => docToPlayer(d.id, d.data()))
    .sort((a, b) => (b.skill ?? -Infinity) - (a.skill ?? -Infinity))
}

export async function getPlayer(id: string): Promise<Player | null> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, PLAYERS_COLLECTION, id))
  return snap.exists() ? docToPlayer(snap.id, snap.data()) : null
}

export async function playerNameExists(tournamentId: string, name: string): Promise<boolean> {
  const snap = await getDocs(tournamentPlayersQuery(tournamentId))
  const normalizedName = name.trim().toLowerCase()
  return snap.docs.some((playerDoc) => playerDoc.get('name')?.trim().toLowerCase() === normalizedName)
}

export async function createPlayer(tournamentId: string, data: PlayerInput): Promise<string> {
  if (!data.name.trim()) throw new Error('Player name is required')
  const db = getFirestore()
  const ref = await addDoc(collection(db, PLAYERS_COLLECTION), {
    tournamentId,
    name: data.name,
    position: data.position,
    skill: data.skill ?? null,
    skills: data.skills ?? null,
    photoUrl: data.photoUrl ?? null,
    goalkeeping: data.goalkeeping ?? null,
    inactive: data.inactive ?? false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return ref.id
}

export async function updatePlayer(id: string, data: Partial<PlayerInput>): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, PLAYERS_COLLECTION, id), { ...data, updatedAt: Timestamp.now() })
}

export async function deletePlayer(id: string): Promise<void> {
  await deleteDoc(doc(getFirestore(), PLAYERS_COLLECTION, id))
}
