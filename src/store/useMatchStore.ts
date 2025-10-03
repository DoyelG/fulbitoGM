import { create } from 'zustand'

export type MatchPlayer = { id: string; name: string; goals: number; performance: number }
export type Match = { id: string; date: string; type: string; teamAScore: number; teamBScore: number; teamA: MatchPlayer[]; teamB: MatchPlayer[]; name?: string }

type MatchStore = {
  matches: Match[]
  matchesInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  addMatch: (m: Omit<Match, 'id'>) => Promise<string>
  deleteMatch: (id: string) => Promise<void>
  hydrateMatches: (matches: Match[]) => void
  clearMatches: () => void
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
      const data: Match[] = await res.json()
      set({ matches: data, matchesInit: 'loaded' })
    } catch (e) {
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
    const { id } = await res.json()
    await get().initLoad()
    return id
  },
  deleteMatch: async (id) => {
    await fetch(`/api/matches/${id}`, { method: 'DELETE' })
    await get().initLoad()
  },
  clearMatches: () => set({ matches: [] })
}))