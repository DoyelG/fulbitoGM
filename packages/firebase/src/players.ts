import {
  getFirestore, collection, doc,
  getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp,
} from 'firebase/firestore'
import type { Player } from '@fulbito/types'

function docToPlayer(id: string, data: Record<string, any>): Player {
  return {
    id,
    name: data.name,
    position: data.position,
    skill: data.skill ?? null,
    skills: data.skills,
    photoUrl: data.photoUrl,
    shirtDutiesCount: data.shirtDutiesCount ?? 0,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
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
    shirtDutiesCount: data.shirtDutiesCount ?? 0,
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

export async function incrementShirtDuty(playerId: string, delta: 1 | -1): Promise<void> {
  const db = getFirestore()
  const player = await getPlayer(playerId)
  if (!player) return
  const newCount = Math.max(0, (player.shirtDutiesCount ?? 0) + delta)
  await updateDoc(doc(db, 'players', playerId), { shirtDutiesCount: newCount, updatedAt: Timestamp.now() })
}
