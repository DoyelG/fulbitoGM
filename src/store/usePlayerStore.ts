import { create } from 'zustand'

type SkillValue = number | 'unknown'
type Skills = { physical: SkillValue; technical: SkillValue; tactical: SkillValue; psychological: SkillValue }
export type Player = { id: string; name: string; skill: number | 'unknown'; position: string; skills?: Skills }

type PlayerStore = {
  players: Player[]
  playersInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  hydratePlayers: (players: Player[]) => void
  addPlayer: (player: Omit<Player, 'id'>) => Promise<void>
  updatePlayer: (id: string, player: Partial<Player>) => Promise<void>
  deletePlayer: (id: string) => Promise<void>
  getPlayer: (id: string) => Player | undefined
}

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  players: [],
  playersInit: 'idle',
  initLoad: async () => {
    const state = get().playersInit
    if (state === 'loading' || state === 'loaded') return
    set({ playersInit: 'loading' })
    try {
      const res = await fetch('/api/players', { cache: 'no-store' })
      const data: Player[] = await res.json()
      set({ players: data, playersInit: 'loaded' })
    } catch (e) {
      set({ playersInit: 'error' })
    }
  },
  hydratePlayers: (players) => {
    set({ players, playersInit: 'loaded' })
  },
  addPlayer: async (player) => {
    const res = await fetch('/api/players', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(player)
    })
    const created: Player = await res.json()
    set(s => ({ players: [...s.players, created].sort((a, b) => a.name.localeCompare(b.name)) }))
  },
  updatePlayer: async (id, updates) => {
    const res = await fetch(`/api/players/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
    })
    const updated: Player = await res.json()
    set(s => ({ players: s.players.map(p => p.id === id ? updated : p) }))
  },
  deletePlayer: async (id) => {
    await fetch(`/api/players/${id}`, { method: 'DELETE' })
    set(s => ({ players: s.players.filter(p => p.id !== id) }))
  },
  getPlayer: (id) => get().players.find(p => p.id === id)
}))