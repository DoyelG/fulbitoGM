import { useEffect, useState } from 'react'
import { getTournamentMembers } from '@fulbito/firebase'
import type { TournamentMember } from '@fulbito/types'

export function useTournamentMembers(tournamentId: string | null): TournamentMember[] {
  const [members, setMembers] = useState<TournamentMember[]>([])

  useEffect(() => {
    if (!tournamentId) return
    let isCurrent = true
    getTournamentMembers(tournamentId)
      .then((loaded) => {
        if (isCurrent) setMembers(loaded)
      })
      .catch(() => undefined)
    return () => {
      isCurrent = false
    }
  }, [tournamentId])

  return members
}
