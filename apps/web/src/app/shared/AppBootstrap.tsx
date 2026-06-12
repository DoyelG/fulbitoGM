'use client'

import { useEffect } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useMatchStore } from '@/store/useMatchStore'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

export default function AppBootstrap() {
  const { user, loading } = useFirebaseAuth()
  const { initLoad: initPlayers, playersInit } = usePlayerStore()
  const { initLoad: initMatches, matchesInit } = useMatchStore()

  useEffect(() => {
    if (loading || !user) return
    if (playersInit === 'idle' || playersInit === 'error') initPlayers()
  }, [loading, user, playersInit, initPlayers])

  useEffect(() => {
    if (loading || !user) return
    if (matchesInit === 'idle' || matchesInit === 'error') initMatches()
  }, [loading, user, matchesInit, initMatches])

  return null
}


