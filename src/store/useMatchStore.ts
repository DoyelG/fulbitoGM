import { create } from 'zustand'

export type MatchPlayer = { id: string; name: string; goals: number; performance: number }
export type Match = { id: string; date: string; type: string; teamAScore: number; teamBScore: number; teamA: MatchPlayer[]; teamB: MatchPlayer[]; name?: string }

type MatchStore = {
  matches: Match[]
  initLoad: () => Promise<void>
  addMatch: (m: Omit<Match, 'id'>) => Promise<string>
  deleteMatch: (id: string) => Promise<void>
  clearMatches: () => void
}

export const useMatchStore = create<MatchStore>()((set, get) => ({
  matches: [],
  initLoad: async () => {
    const res = await fetch('/api/matches', { cache: 'no-store' })
    const data: Match[] = await res.json()
    set({ matches: data })
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