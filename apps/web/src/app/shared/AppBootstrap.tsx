'use client'

import { useEffect } from 'react'
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
  const { initLoad: initPlayers, playersInit } = usePlayerStore()
  const { initLoad: initMatches, matchesInit } = useMatchStore()
  const activeTournamentId = useTournamentStore((state) => state.activeTournamentId)

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
