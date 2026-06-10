import { create } from 'zustand'
import type { Player } from '@fulbito/types'
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp, type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type { Player }

function docToPlayer(id: string, data: DocumentData): Player {
  return {
    id,
    name: data.name,
    position: data.position,
    skill: data.skill ?? null,
    skills: data.skills,
    photoUrl: data.photoUrl,
    goalkeeping: data.goalkeeping ?? undefined,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  }
}

async function fetchPlayers(): Promise<Player[]> {
  const snap = await getDocs(query(collection(db, 'players'), orderBy('skill', 'desc')))
  return snap.docs.map(d => docToPlayer(d.id, d.data()))
}

type PlayerStore = {
  players: Player[]
  playersInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  hydratePlayers: (players: Player[]) => void
  addPlayer: (player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updatePlayer: (id: string, player: Partial<Player>) => Promise<void>
  deletePlayer: (id: string) => Promise<void>
  getPlayer: (id: string) => Player | undefined
  resetAndReload: () => Promise<void>
}

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  players: [],
  playersInit: 'idle',
  initLoad: async () => {
    const state = get().playersInit
    if (state === 'loading' || state === 'loaded') return
    set({ playersInit: 'loading' })
    try {
      const data = await fetchPlayers()
      set({ players: data, playersInit: 'loaded' })
    } catch {
      set({ playersInit: 'error' })
    }
  },
  hydratePlayers: (players) => {
    set({ players, playersInit: 'loaded' })
  },
  addPlayer: async (player) => {
    await addDoc(collection(db, 'players'), {
      ...player,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    await get().resetAndReload()
  },
  updatePlayer: async (id, updates) => {
    await updateDoc(doc(db, 'players', id), { ...updates, updatedAt: Timestamp.now() })
    await get().resetAndReload()
  },
  deletePlayer: async (id) => {
    await deleteDoc(doc(db, 'players', id))
    set(s => ({ players: s.players.filter(p => p.id !== id) }))
    await get().resetAndReload()
  },
  getPlayer: (id) => get().players.find(p => p.id === id),
  resetAndReload: async () => {
    const data = await fetchPlayers()
    set({ players: data, playersInit: 'loaded' })
  },
}))
