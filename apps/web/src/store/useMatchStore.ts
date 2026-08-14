import { create } from 'zustand'
import type { Match } from '@fulbito/types'
import { getMatches, createMatch, updateMatch, deleteMatch } from '@fulbito/firebase'

type MatchStore = {
  matches: Match[]
  matchesInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  addMatch: (m: Omit<Match, 'id'>) => Promise<string>
  updateMatch: (id: string, m: Omit<Match, 'id'>) => Promise<void>
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
      const data = await getMatches()
      set({ matches: data, matchesInit: 'loaded' })
    } catch {
      set({ matchesInit: 'error' })
    }
  },
  hydrateMatches: (matches) => {
    set({ matches, matchesInit: 'loaded' })
  },
  addMatch: async (m) => {
    const id = await createMatch(m)
    await get().resetAndReload()
    return id
  },
  updateMatch: async (id, m) => {
    await updateMatch(id, m)
    await get().resetAndReload()
  },
  deleteMatch: async (id) => {
    await deleteMatch(id)
    await get().resetAndReload()
  },
  resetAndReload: async () => {
    const data = await getMatches()
    set({ matches: data, matchesInit: 'loaded' })
  },
}))
