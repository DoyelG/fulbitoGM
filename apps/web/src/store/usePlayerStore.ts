import { create } from 'zustand'
import type { Player } from '@fulbito/types'
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '@fulbito/firebase'

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
      const data = await getPlayers()
      set({ players: data, playersInit: 'loaded' })
    } catch {
      set({ playersInit: 'error' })
    }
  },
  hydratePlayers: (players) => {
    set({ players, playersInit: 'loaded' })
  },
  addPlayer: async (player) => {
    await createPlayer(player)
    await get().resetAndReload()
  },
  updatePlayer: async (id, updates) => {
    await updatePlayer(id, updates as Partial<Omit<Player, 'id' | 'createdAt'>>)
    await get().resetAndReload()
  },
  deletePlayer: async (id) => {
    await deletePlayer(id)
    set(s => ({ players: s.players.filter(p => p.id !== id) }))
    await get().resetAndReload()
  },
  getPlayer: (id) => get().players.find(p => p.id === id),
  resetAndReload: async () => {
    const data = await getPlayers()
    set({ players: data, playersInit: 'loaded' })
  },
}))
