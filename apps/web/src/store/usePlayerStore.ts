import { create } from 'zustand'
import type { Player } from '@fulbito/types'

export type { Player }

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
      const res = await fetch('/api/players', { cache: 'no-store' })
      const data: Player[] = await res.json()
      set({ players: data, playersInit: 'loaded' })
    } catch {
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
    if (!res.ok) {
      const msg = await res.text().catch(() => '')
      throw new Error(msg || 'Failed to create player')
    }
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) throw new Error('Unexpected response creating player')
    const created: Player = await res.json()
    set(s => ({ players: [...s.players, created].sort((a, b) => a.name.localeCompare(b.name)) }))
    await get().resetAndReload()
  },
  updatePlayer: async (id, updates) => {
    const res = await fetch(`/api/players/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
    })
    if (!res.ok) {
      const msg = await res.text().catch(() => '')
      throw new Error(msg || 'Failed to update player')
    }
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) throw new Error('Unexpected response updating player')
    const updated: Player = await res.json()
    set(s => ({ players: s.players.map(p => p.id === id ? updated : p) }))
    await get().resetAndReload()
  },
  deletePlayer: async (id) => {
    const res = await fetch(`/api/players/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const msg = await res.text().catch(() => '')
      throw new Error(msg || 'Failed to delete player')
    }
    set(s => ({ players: s.players.filter(p => p.id !== id) }))
    await get().resetAndReload()
  },
  getPlayer: (id) => get().players.find(p => p.id === id),
  resetAndReload: async () => {
    const res = await fetch('/api/players', { cache: 'no-store' })
    const data: Player[] = await res.json()
    set({ players: data, playersInit: 'loaded' })
  },
}))