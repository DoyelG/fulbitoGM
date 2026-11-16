import { create } from 'zustand'
import type { Player } from '@fulbito/types'
import {
  createInvitation,
  createPlayer,
  deletePlayer,
  getPlayers,
  setMemberPlayer,
  updatePlayer,
  type PlayerInput,
} from '@fulbito/firebase'
import { getActiveTournamentId, isStillActive } from './active-tournament'

export type { Player }

export type PlayerLink = { kind: 'none' } | { kind: 'member'; uid: string } | { kind: 'invite'; email: string }

type PlayerStore = {
  players: Player[]
  playersInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  hydratePlayers: (players: Player[]) => void
  addPlayer: (player: PlayerInput) => Promise<string>
  linkPlayer: (playerId: string, link: PlayerLink, actorUid: string, currentUid?: string | null) => Promise<void>
  updatePlayer: (id: string, player: Partial<PlayerInput>) => Promise<void>
  deletePlayer: (id: string) => Promise<void>
  getPlayer: (id: string) => Player | undefined
  resetAndReload: () => Promise<void>
  reset: () => void
}

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  players: [],
  playersInit: 'idle',
  initLoad: async () => {
    const state = get().playersInit
    if (state === 'loading' || state === 'loaded') return
    set({ playersInit: 'loading' })
    let tournamentId: string | null = null
    try {
      tournamentId = getActiveTournamentId()
      await get().resetAndReload()
    } catch {
      if (!tournamentId || isStillActive(tournamentId)) set({ playersInit: 'error' })
    }
  },
  hydratePlayers: (players) => {
    set({ players, playersInit: 'loaded' })
  },
  addPlayer: async (player) => {
    const playerId = await createPlayer(getActiveTournamentId(), player)
    await get().resetAndReload()
    return playerId
  },
  linkPlayer: async (playerId, link, actorUid, currentUid = null) => {
    const tournamentId = getActiveTournamentId()
    if (currentUid && !(link.kind === 'member' && link.uid === currentUid)) {
      await setMemberPlayer(tournamentId, currentUid, null)
    }
    if (link.kind === 'member') await setMemberPlayer(tournamentId, link.uid, playerId)
    if (link.kind === 'invite') {
      await createInvitation({ tournamentId, email: link.email, role: 'MEMBER', playerId, invitedBy: actorUid })
    }
  },
  updatePlayer: async (id, updates) => {
    await updatePlayer(id, updates)
    await get().resetAndReload()
  },
  deletePlayer: async (id) => {
    await deletePlayer(id)
    set((s) => ({ players: s.players.filter((p) => p.id !== id) }))
    await get().resetAndReload()
  },
  getPlayer: (id) => get().players.find((p) => p.id === id),
  resetAndReload: async () => {
    const tournamentId = getActiveTournamentId()
    const data = await getPlayers(tournamentId)
    if (isStillActive(tournamentId)) set({ players: data, playersInit: 'loaded' })
  },
  reset: () => set({ players: [], playersInit: 'idle' }),
}))
