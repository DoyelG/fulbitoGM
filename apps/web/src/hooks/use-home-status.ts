'use client'

import { useCallback } from 'react'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'

export type HomeStatus = 'loading' | 'error' | 'ready'

export function useHomeStatus(): { status: HomeStatus; retry: () => void } {
  const matchesInit = useMatchStore((s) => s.matchesInit)
  const playersInit = usePlayerStore((s) => s.playersInit)
  const loadMatches = useMatchStore((s) => s.initLoad)
  const loadPlayers = usePlayerStore((s) => s.initLoad)

  const status: HomeStatus =
    matchesInit === 'error' || playersInit === 'error'
      ? 'error'
      : matchesInit === 'loaded' && playersInit === 'loaded'
        ? 'ready'
        : 'loading'

  const retry = useCallback(() => {
    void loadMatches()
    void loadPlayers()
  }, [loadMatches, loadPlayers])

  return { status, retry }
}
