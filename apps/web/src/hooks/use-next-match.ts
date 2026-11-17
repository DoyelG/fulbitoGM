'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Match, MyTournament } from '@fulbito/types'
import { getDraftMatches } from '@fulbito/firebase'
import { pickUpcomingMatches, toLocalDay } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { useTournamentStore } from '@/store/useTournamentStore'

type UpcomingMatch = Pick<Match, 'id' | 'date' | 'hasTime' | 'name' | 'status'>

export type TournamentUpcomingMatch = {
  match: UpcomingMatch
  tournament: MyTournament['tournament']
}

export function useUpcomingMatches() {
  const matches = useMatchStore((s) => s.matches)
  const today = toLocalDay(new Date())
  return useMemo(() => pickUpcomingMatches(matches, today), [matches, today])
}

export function useNextMatch() {
  return useUpcomingMatches()[0] ?? null
}

export function useUpcomingMatchesAcrossTournaments(enabled: boolean): TournamentUpcomingMatch[] {
  const myTournaments = useTournamentStore((s) => s.myTournaments)
  const activeTournamentId = useTournamentStore((s) => s.activeTournamentId)
  const activeMatches = useUpcomingMatches()
  const [fetchedByTournament, setFetchedByTournament] = useState<Map<string, UpcomingMatch[]>>(new Map())

  const otherIdsKey = myTournaments
    .map(({ tournament }) => tournament.id)
    .filter((id) => id !== activeTournamentId)
    .join(',')

  useEffect(() => {
    if (!enabled || !otherIdsKey) return
    let isCurrent = true
    const today = toLocalDay(new Date())
    const tournamentIds = otherIdsKey.split(',')
    Promise.allSettled(tournamentIds.map((id) => getDraftMatches(id))).then((results) => {
      if (!isCurrent) return
      setFetchedByTournament((previous) => {
        const next = new Map(previous)
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') next.set(tournamentIds[index], pickUpcomingMatches(result.value, today))
        })
        return next
      })
    })
    return () => {
      isCurrent = false
    }
  }, [enabled, otherIdsKey])

  return useMemo(() => {
    const rows = myTournaments.flatMap(({ tournament }) => {
      const matches =
        tournament.id === activeTournamentId ? activeMatches : (fetchedByTournament.get(tournament.id) ?? [])
      return matches.map((match) => ({ match, tournament }))
    })
    return rows.sort((a, b) => a.match.date.localeCompare(b.match.date))
  }, [myTournaments, activeTournamentId, activeMatches, fetchedByTournament])
}
