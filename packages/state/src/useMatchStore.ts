import { Match } from '@fulbito/types'
import { create } from 'zustand'
import { apiFetch } from './api'

type MatchStore = {
  matches: Match[]
  matchesInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: (opts?: { force?: boolean }) => Promise<void>
  addMatch: (m: Omit<Match, 'id'>) => Promise<string>
  updateMatch: (id: string, m: Omit<Match, 'id'>) => Promise<void>
  deleteMatch: (id: string) => Promise<void>
  hydrateMatches: (matches: Match[]) => void
  resetAndReload: () => Promise<void>
}

export const useMatchStore = create<MatchStore>()((set, get) => ({
  matches: [],
  matchesInit: 'idle',
  initLoad: async (opts) => {
    const force = opts?.force === true
    const state = get().matchesInit
    if (!force && (state === 'loading' || state === 'loaded')) return
    if (force && state === 'loading') return
    set({ matchesInit: 'loading' })
    try {
      const res = await apiFetch('/api/matches', { cache: 'no-store' })
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
    const res = await apiFetch('/api/matches', {
      method: 'POST',
      body: JSON.stringify(m),
    })
    if (!res.ok) throw new Error('Failed to create match')
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) throw new Error('Unexpected response creating match')
    const { id } = await res.json()
    await get().resetAndReload()
    return id
  },
  updateMatch: async (id, m) => {
    const res = await apiFetch(`/api/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(m),
    })
    if (!res.ok) throw new Error('Failed to update match')
    await get().resetAndReload()
  },
  deleteMatch: async (id) => {
    await apiFetch(`/api/matches/${id}`, { method: 'DELETE' })
    await get().resetAndReload()
  },
  resetAndReload: async () => {
    const res = await apiFetch('/api/matches', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load matches')
    const data: Match[] = await res.json()
    set({ matches: data, matchesInit: 'loaded' })
  },
}))
