'use client'

import { useEffect } from 'react'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useMatchStore } from '@/store/useMatchStore'
import { useVideoClipStore } from '@/store/useVideoClipStore'
import { useAddressStore } from '@/store/useAddressStore'
import { useTournamentStore } from '@/store/useTournamentStore'

function resetTournamentData() {
  usePlayerStore.getState().reset()
  useMatchStore.getState().reset()
  useVideoClipStore.getState().reset()
  useAddressStore.getState().reset()
}

export default function AppBootstrap() {
  const { user, loading } = useFirebaseAuth()
  const { initLoad: initPlayers, playersInit } = usePlayerStore()
  const { initLoad: initMatches, matchesInit } = useMatchStore()
  const myTournamentsInit = useTournamentStore((state) => state.myTournamentsInit)
  const myTournamentsUid = useTournamentStore((state) => state.myTournamentsUid)
  const activeTournamentId = useTournamentStore((state) => state.activeTournamentId)
  const loadMyTournaments = useTournamentStore((state) => state.loadMyTournaments)
  const clearTournaments = useTournamentStore((state) => state.clearTournaments)

  useEffect(() => {
    if (loading) return
    if (!user) {
      if (myTournamentsUid) clearTournaments()
      return
    }
    if (myTournamentsInit === 'idle' || myTournamentsUid !== user.uid) loadMyTournaments(user.uid)
  }, [loading, user, myTournamentsInit, myTournamentsUid, loadMyTournaments, clearTournaments])

  useEffect(() => {
    resetTournamentData()
  }, [activeTournamentId])

  useEffect(() => {
    if (activeTournamentId && (playersInit === 'idle' || playersInit === 'error')) initPlayers()
  }, [activeTournamentId, playersInit, initPlayers])

  useEffect(() => {
    if (activeTournamentId && (matchesInit === 'idle' || matchesInit === 'error')) initMatches()
  }, [activeTournamentId, matchesInit, initMatches])

  return null
}
