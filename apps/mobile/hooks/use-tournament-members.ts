import { getTournamentMembers } from '@fulbito/firebase'
import type { TournamentMember } from '@fulbito/types'
import { useEffect, useState } from 'react'

export function useTournamentMembers(tournamentId: string | null): TournamentMember[] {
  const [members, setMembers] = useState<TournamentMember[]>([])

  useEffect(() => {
    if (!tournamentId) return
    let isCurrent = true
    getTournamentMembers(tournamentId)
      .then((nextMembers) => {
        if (isCurrent) setMembers(nextMembers)
      })
      .catch(() => undefined)
    return () => {
      isCurrent = false
    }
  }, [tournamentId])

  return members
}
