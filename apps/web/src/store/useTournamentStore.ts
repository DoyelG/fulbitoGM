import { create } from 'zustand'
import type { MyTournament } from '@fulbito/types'
import { createTournament, getMyTournaments } from '@fulbito/firebase'

export type TournamentInput = { name: string; description?: string }

type TournamentOwner = { uid: string; email: string }

type TournamentStore = {
  myTournaments: MyTournament[]
  myTournamentsInit: 'idle' | 'loading' | 'loaded' | 'error'
  myTournamentsUid: string | null
  loadMyTournaments: (uid: string) => Promise<void>
  addTournament: (data: TournamentInput, owner: TournamentOwner) => Promise<string>
  clearTournaments: () => void
}

export const useTournamentStore = create<TournamentStore>()((set, get) => ({
  myTournaments: [],
  myTournamentsInit: 'idle',
  myTournamentsUid: null,
  loadMyTournaments: async (uid) => {
    if (get().myTournamentsInit === 'loading') return
    set({ myTournamentsInit: 'loading', myTournamentsUid: uid })
    try {
      const data = await getMyTournaments(uid)
      set({ myTournaments: data, myTournamentsInit: 'loaded' })
    } catch {
      set({ myTournamentsInit: 'error' })
    }
  },
  addTournament: async (data, owner) => {
    const id = await createTournament({ ...data, ownerUid: owner.uid, ownerEmail: owner.email })
    await get().loadMyTournaments(owner.uid)
    return id
  },
  clearTournaments: () => {
    set({ myTournaments: [], myTournamentsInit: 'idle', myTournamentsUid: null })
  },
}))
