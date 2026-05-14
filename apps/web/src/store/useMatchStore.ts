import { create } from 'zustand'
import type { Match } from '@fulbito/types'
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

function docToMatch(id: string, data: Record<string, any>): Match {
  return {
    id,
    date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
    type: data.type,
    name: data.name ?? undefined,
    teamAScore: data.teamAScore,
    teamBScore: data.teamBScore,
    teamA: data.teamA ?? [],
    teamB: data.teamB ?? [],
    shirtsResponsibleId: data.shirtsResponsibleId ?? null,
  }
}

async function fetchMatches(): Promise<Match[]> {
  const snap = await getDocs(query(collection(db, 'matches'), orderBy('date', 'desc')))
  return snap.docs.map(d => docToMatch(d.id, d.data() as Record<string, any>))
}

type MatchStore = {
  matches: Match[]
  matchesInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  addMatch: (m: Omit<Match, 'id'>) => Promise<string>
  updateMatch: (id: string, m: Omit<Match, 'id'>) => Promise<void>
  setMvp: (id: string, mvpId: string | null) => Promise<void>
  deleteMatch: (id: string) => Promise<void>
  hydrateMatches: (matches: Match[]) => void
  resetAndReload: () => Promise<void>
}

export const useMatchStore = create<MatchStore>()((set, get) => ({
  matches: [],
  matchesInit: 'idle',
  initLoad: async () => {
    const state = get().matchesInit
    if (state === 'loading' || state === 'loaded') return
    set({ matchesInit: 'loading' })
    try {
      const data = await fetchMatches()
      set({ matches: data, matchesInit: 'loaded' })
    } catch {
      set({ matchesInit: 'error' })
    }
  },
  hydrateMatches: (matches) => {
    set({ matches, matchesInit: 'loaded' })
  },
  addMatch: async (m) => {
    const ref = await addDoc(collection(db, 'matches'), {
      ...m,
      date: Timestamp.fromDate(new Date(m.date)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    await get().resetAndReload()
    return ref.id
  },
  updateMatch: async (id, m) => {
    await updateDoc(doc(db, 'matches', id), {
      ...m,
      date: Timestamp.fromDate(new Date(m.date)),
      updatedAt: Timestamp.now(),
    })
    await get().resetAndReload()
  },
  setMvp: async (id, mvpId) => {
    const res = await fetch(`/api/matches/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mvpId })
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Failed to set MVP' }))
      throw new Error(body.error || 'Failed to set MVP')
    }
    set({ matches: get().matches.map(m => m.id === id ? { ...m, mvpId } : m) })
  },
  deleteMatch: async (id) => {
    await deleteDoc(doc(db, 'matches', id))
    await get().resetAndReload()
  },
  resetAndReload: async () => {
    const data = await fetchMatches()
    set({ matches: data, matchesInit: 'loaded' })
  },
}))
