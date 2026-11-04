import { create } from 'zustand'
import type { CreatedTournament, MyTournament } from '@fulbito/types'
import { activeTournamentStorageKey, resolveActiveTournamentId } from '@fulbito/utils'
import {
  createTournament,
  deleteTournament,
  deleteTournamentPhoto,
  getMyTournaments,
  leaveTournament,
  setMemberPlayer,
  updateTournament,
  uploadTournamentPhoto,
} from '@fulbito/firebase'

export type TournamentInput = {
  name: string
  description?: string
  photoFile?: File | null
}

type TournamentOwner = { uid: string; email: string }

type TournamentStore = {
  myTournaments: MyTournament[]
  myTournamentsInit: 'idle' | 'loading' | 'loaded' | 'error'
  myTournamentsUid: string | null
  activeTournamentId: string | null
  loadMyTournaments: (uid: string) => Promise<void>
  addTournament: (data: TournamentInput, owner: TournamentOwner) => Promise<CreatedTournament>
  editTournament: (tournamentId: string, data: TournamentInput) => Promise<void>
  removeTournament: (tournamentId: string) => Promise<void>
  exitTournament: (tournamentId: string) => Promise<void>
  assignMyPlayer: (tournamentId: string, playerId: string | null) => Promise<void>
  setActiveTournament: (tournamentId: string) => void
  clearTournaments: () => void
}

function readStoredActiveTournament(uid: string): string | null {
  try {
    return window.localStorage.getItem(activeTournamentStorageKey(uid))
  } catch {
    return null
  }
}

function storeActiveTournament(uid: string, tournamentId: string): void {
  try {
    window.localStorage.setItem(activeTournamentStorageKey(uid), tournamentId)
  } catch {
    return
  }
}

let latestLoadId = 0

export const useTournamentStore = create<TournamentStore>()((set, get) => ({
  myTournaments: [],
  myTournamentsInit: 'idle',
  myTournamentsUid: null,
  activeTournamentId: null,
  loadMyTournaments: async (uid) => {
    const loadId = ++latestLoadId
    const isLatestLoad = () => loadId === latestLoadId && get().myTournamentsUid === uid
    const { myTournamentsInit, myTournamentsUid } = get()
    const isRefresh = myTournamentsInit === 'loaded' && myTournamentsUid === uid
    if (!isRefresh) set({ myTournamentsInit: 'loading', myTournamentsUid: uid })
    try {
      const data = await getMyTournaments(uid)
      if (!isLatestLoad()) return
      const activeTournamentId = resolveActiveTournamentId(data, readStoredActiveTournament(uid))
      set({ myTournaments: data, myTournamentsInit: 'loaded', activeTournamentId })
    } catch {
      if (isLatestLoad()) set({ myTournamentsInit: 'error' })
    }
  },
  addTournament: async (data, owner) => {
    const id = await createTournament({
      name: data.name,
      description: data.description,
      ownerUid: owner.uid,
      ownerEmail: owner.email,
    })
    storeActiveTournament(owner.uid, id)
    let photoSaved = true
    if (data.photoFile) {
      try {
        const photoUrl = await uploadTournamentPhoto(data.photoFile, id)
        await updateTournament(id, { photoUrl })
      } catch {
        photoSaved = false
      }
    }
    await get().loadMyTournaments(owner.uid)
    return { id, photoSaved }
  },
  editTournament: async (tournamentId, data) => {
    const previousPhotoUrl = get().myTournaments.find(({ tournament }) => tournament.id === tournamentId)?.tournament
      .photoUrl
    let photoUrl: string | undefined
    if (data.photoFile) photoUrl = await uploadTournamentPhoto(data.photoFile, tournamentId)
    if (data.photoFile === null) photoUrl = ''
    try {
      await updateTournament(tournamentId, { name: data.name, description: data.description ?? '', photoUrl })
    } catch (error) {
      if (photoUrl) await deleteTournamentPhoto(photoUrl)
      throw error
    }
    if (photoUrl !== undefined && previousPhotoUrl) await deleteTournamentPhoto(previousPhotoUrl)
    const uid = get().myTournamentsUid
    if (uid) await get().loadMyTournaments(uid)
  },
  removeTournament: async (tournamentId) => {
    const uid = get().myTournamentsUid
    if (!uid) throw new Error('Not signed in')
    await deleteTournament(tournamentId, uid)
    await get().loadMyTournaments(uid)
  },
  exitTournament: async (tournamentId) => {
    const uid = get().myTournamentsUid
    if (!uid) throw new Error('Not signed in')
    await leaveTournament(tournamentId, uid)
    await get().loadMyTournaments(uid)
  },
  assignMyPlayer: async (tournamentId, playerId) => {
    const uid = get().myTournamentsUid
    if (!uid) throw new Error('Not signed in')
    await setMemberPlayer(tournamentId, uid, playerId)
    await get().loadMyTournaments(uid)
  },
  setActiveTournament: (tournamentId) => {
    const uid = get().myTournamentsUid
    if (uid) storeActiveTournament(uid, tournamentId)
    set({ activeTournamentId: tournamentId })
  },
  clearTournaments: () => {
    latestLoadId++
    set({ myTournaments: [], myTournamentsInit: 'idle', myTournamentsUid: null, activeTournamentId: null })
  },
}))

export function selectActiveTournament(state: TournamentStore): MyTournament | null {
  return state.myTournaments.find(({ tournament }) => tournament.id === state.activeTournamentId) ?? null
}

export function selectMyPlayerId(state: TournamentStore): string | null {
  return selectActiveTournament(state)?.membership.playerId ?? null
}
