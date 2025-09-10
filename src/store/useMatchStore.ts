import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type MatchPlayer = { id: string; name: string; goals: number; performance: number }
export type Match = { id: string; date: string; type: string; teamAScore: number; teamBScore: number; teamA: MatchPlayer[]; teamB: MatchPlayer[]; name?: string }

type MatchStore = {
  matches: Match[]
  initLoad: () => Promise<void>
  addMatch: (m: Omit<Match, 'id'>) => Promise<string>
  deleteMatch: (id: string) => Promise<void>
  clearMatches: () => void
}

export const useMatchStore = create<MatchStore>()(
  persist(
    (set, get) => ({
      matches: [],
      initLoad: async () => {
        const res = await fetch('/api/matches', { cache: 'no-store' })
        const data: Match[] = await res.json()
        set({ matches: data })
      },
      addMatch: async (m) => {
        const res = await fetch('/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) })
        const { id } = await res.json()
        await get().initLoad()
        return id
      },
      deleteMatch: async (id) => {
        // Implement /api/matches/[id] if you want delete; for now just remove locally
        set(s => ({ matches: s.matches.filter(x => x.id !== id) }))
      },
      clearMatches: () => set({ matches: [] })
    }),
    { name: 'fulbito-matches', storage: createJSONStorage(() => localStorage) }
  )
)