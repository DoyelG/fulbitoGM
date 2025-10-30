import { create } from 'zustand'

export type MatchPlayer = { id: string; name: string; goals: number; performance: number }
export type Match = { id: string; date: string; type: string; teamAScore: number; teamBScore: number; teamA: MatchPlayer[]; teamB: MatchPlayer[]; name?: string }

type MatchStore = {
  matches: Match[]
  matchesInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  addMatch: (m: Omit<Match, 'id'>) => Promise<string>
  updateMatch: (id: string, m: Omit<Match, 'id'>) => Promise<void>
  deleteMatch: (id: string) => Promise<void>
  hydrateMatches: (matches: Match[]) => void
}

export const useMatchStore = create<MatchStore>()((set, get) => ({
  matches: [],
  matchesInit: 'idle',
  initLoad: async () => {
    const state = get().matchesInit
    if (state === 'loading' || state === 'loaded') return
    set({ matchesInit: 'loading' })
    try {
      const res = await fetch('/api/matches', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load matches')
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) throw new Error('Unexpected response')
      const data: Match[] = await res.json()
      set({ matches: data, matchesInit: 'loaded' })
    } catch {
      set({ matchesInit: 'error' })
    }
  },
  hydrateMatches: (matches) => {
    set({ matches, matchesInit: 'loaded' })
  },
  addMatch: async (m) => {
    const res = await fetch('/api/matches', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m)
    })
    if (!res.ok) throw new Error('Failed to create match')
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) throw new Error('Unexpected response creating match')
    const { id } = await res.json()
    await get().initLoad()
    return id
  },
  updateMatch: async (id, m) => {
    const res = await fetch(`/api/matches/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m)
    })
    if (!res.ok) throw new Error('Failed to update match')
    await get().initLoad()
  },
  deleteMatch: async (id) => {
    await fetch(`/api/matches/${id}`, { method: 'DELETE' })
    await get().initLoad()
  }
}))