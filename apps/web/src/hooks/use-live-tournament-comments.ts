'use client'

import { useEffect } from 'react'
import { useTournamentDetailStore } from '@/store/useTournamentDetailStore'

export function useLiveTournamentComments(tournamentId: string | null, ready: boolean): void {
  const watchComments = useTournamentDetailStore((state) => state.watchComments)

  useEffect(() => {
    if (!tournamentId || !ready) return
    return watchComments(tournamentId)
  }, [tournamentId, ready, watchComments])
}
