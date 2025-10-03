'use client'

import { useEffect } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useMatchStore } from '@/store/useMatchStore'

export default function AppBootstrap() {
  const { initLoad: initPlayers, playersInit } = usePlayerStore()
  const { initLoad: initMatches, matchesInit } = useMatchStore()

  useEffect(() => {
    if (playersInit === 'idle') initPlayers()
  }, [playersInit, initPlayers])

  useEffect(() => {
    if (matchesInit === 'idle') initMatches()
  }, [matchesInit, initMatches])

  return null
}


