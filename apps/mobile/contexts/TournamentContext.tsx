import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  createTournament as firebaseCreateTournament,
  deleteTournament as firebaseDeleteTournament,
  deleteTournamentPhoto,
  getMyTournaments,
  leaveTournament as firebaseLeaveTournament,
  setMemberPlayer,
  updateTournament,
  uploadTournamentPhoto,
} from '@fulbito/firebase'
import type { MyTournament } from '@fulbito/types'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

export type TournamentsStatus = 'loading' | 'loaded' | 'error'

export type TournamentInput = { name: string; description?: string; photoUri?: string | null }

type TournamentContextValue = {
  myTournaments: MyTournament[]
  status: TournamentsStatus
  activeTournament: MyTournament | null
  reload: () => Promise<void>
  setActiveTournament: (tournamentId: string) => void
  createTournament: (input: TournamentInput) => Promise<string>
  editTournament: (tournamentId: string, input: TournamentInput) => Promise<void>
  deleteTournament: (tournamentId: string) => Promise<void>
  leaveTournament: (tournamentId: string) => Promise<void>
  assignMyPlayer: (tournamentId: string, playerId: string | null) => Promise<void>
}

async function uploadPhotoFromUri(uri: string, tournamentId: string): Promise<string> {
  const blob = await (await fetch(uri)).blob()
  return uploadTournamentPhoto(blob, tournamentId)
}

const TournamentContext = createContext<TournamentContextValue | null>(null)

const activeTournamentKey = (uid: string) => `fulbito:activeTournament:${uid}`

async function readStoredActiveTournament(uid: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(activeTournamentKey(uid))
  } catch {
    return null
  }
}

async function storeActiveTournament(uid: string, tournamentId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(activeTournamentKey(uid), tournamentId)
  } catch {
    return
  }
}

function resolveActiveTournament(tournaments: MyTournament[], preferredId: string | null): string | null {
  if (preferredId && tournaments.some(({ tournament }) => tournament.id === preferredId)) return preferredId
  return tournaments[0]?.tournament.id ?? null
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const { user } = useFirebaseAuth()
  const uid = user?.uid ?? null
  const email = user?.email ?? null
  const [myTournaments, setMyTournaments] = useState<MyTournament[]>([])
  const [status, setStatus] = useState<TournamentsStatus>('loading')
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null)
  const currentUid = useRef(uid)

  useEffect(() => {
    currentUid.current = uid
  }, [uid])

  const reload = useCallback(async () => {
    if (!uid) return
    try {
      const [tournaments, storedId] = await Promise.all([getMyTournaments(uid), readStoredActiveTournament(uid)])
      if (currentUid.current !== uid) return
      setMyTournaments(tournaments)
      setActiveTournamentId((previousId) => resolveActiveTournament(tournaments, previousId ?? storedId))
      setStatus('loaded')
    } catch {
      if (currentUid.current === uid) setStatus('error')
    }
  }, [uid])

  useEffect(() => {
    setMyTournaments([])
    setActiveTournamentId(null)
    setStatus('loading')
    void reload()
  }, [reload])

  const setActiveTournament = useCallback(
    (tournamentId: string) => {
      setActiveTournamentId(tournamentId)
      if (uid) void storeActiveTournament(uid, tournamentId)
    },
    [uid],
  )

  const createTournament = useCallback(
    async (input: TournamentInput) => {
      if (!uid || !email) throw new Error('Not signed in')
      const tournamentId = await firebaseCreateTournament({
        name: input.name,
        description: input.description,
        ownerUid: uid,
        ownerEmail: email,
      })
      if (input.photoUri) {
        const photoUrl = await uploadPhotoFromUri(input.photoUri, tournamentId)
        await updateTournament(tournamentId, { photoUrl })
      }
      setActiveTournament(tournamentId)
      await reload()
      return tournamentId
    },
    [uid, email, reload, setActiveTournament],
  )

  const editTournament = useCallback(
    async (tournamentId: string, input: TournamentInput) => {
      const previousPhotoUrl = myTournaments.find(({ tournament }) => tournament.id === tournamentId)?.tournament
        .photoUrl
      let photoUrl: string | undefined
      if (input.photoUri) photoUrl = await uploadPhotoFromUri(input.photoUri, tournamentId)
      if (input.photoUri === null) photoUrl = ''
      await updateTournament(tournamentId, { name: input.name, description: input.description ?? '', photoUrl })
      if (photoUrl !== undefined && previousPhotoUrl) await deleteTournamentPhoto(previousPhotoUrl)
      await reload()
    },
    [myTournaments, reload],
  )

  const deleteTournament = useCallback(
    async (tournamentId: string) => {
      if (!uid) throw new Error('Not signed in')
      await firebaseDeleteTournament(tournamentId, uid)
      await reload()
    },
    [uid, reload],
  )

  const leaveTournament = useCallback(
    async (tournamentId: string) => {
      if (!uid) throw new Error('Not signed in')
      await firebaseLeaveTournament(tournamentId, uid)
      await reload()
    },
    [uid, reload],
  )

  const assignMyPlayer = useCallback(
    async (tournamentId: string, playerId: string | null) => {
      if (!uid) throw new Error('Not signed in')
      await setMemberPlayer(tournamentId, uid, playerId)
      await reload()
    },
    [uid, reload],
  )

  const activeTournament = myTournaments.find(({ tournament }) => tournament.id === activeTournamentId) ?? null

  const value = useMemo<TournamentContextValue>(
    () => ({
      myTournaments,
      status,
      activeTournament,
      reload,
      setActiveTournament,
      createTournament,
      editTournament,
      deleteTournament,
      leaveTournament,
      assignMyPlayer,
    }),
    [
      myTournaments,
      status,
      activeTournament,
      reload,
      setActiveTournament,
      createTournament,
      editTournament,
      deleteTournament,
      leaveTournament,
      assignMyPlayer,
    ],
  )

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>
}

export function useTournaments(): TournamentContextValue {
  const ctx = useContext(TournamentContext)
  if (!ctx) throw new Error('useTournaments must be used inside TournamentProvider')
  return ctx
}

export function useActiveTournamentId(): string | null {
  return useTournaments().activeTournament?.tournament.id ?? null
}

export function useMyPlayerId(): string | null {
  return useTournaments().activeTournament?.membership.playerId ?? null
}
