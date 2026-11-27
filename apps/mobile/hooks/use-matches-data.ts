import type { Match, MatchInput, PitchPosition, Player } from '@fulbito/types'
import { useCallback } from 'react'
import {
  getMatches,
  getPlayers,
  createMatch,
  updateMatch,
  updateMatchPlayerPositions,
  deleteMatch,
} from '@fulbito/firebase'

import { useActiveTournamentId } from '@/contexts/TournamentContext'
import { useTournamentResource } from '@/hooks/use-tournament-resource'

export type MatchesDataState = {
  matches: Match[]
  players: Player[]
  loading: boolean
  refreshing: boolean
  error: string | null
  reload: () => Promise<void>
  refresh: () => Promise<void>
  deleteMatch: (id: string) => Promise<void>
  addMatch: (m: MatchInput) => Promise<string>
  updateMatch: (id: string, m: MatchInput) => Promise<void>
  updateMatchPositions: (id: string, positions: Record<string, PitchPosition>) => Promise<void>
}

type MatchesData = { matches: Match[]; players: Player[] }

const EMPTY_MATCHES_DATA: MatchesData = { matches: [], players: [] }

async function fetchMatchesData(tournamentId: string): Promise<MatchesData> {
  const [matches, players] = await Promise.all([getMatches(tournamentId), getPlayers(tournamentId)])
  return { matches, players }
}

function requireTournament(tournamentId: string | null): string {
  if (!tournamentId) throw new Error('No hay un torneo activo')
  return tournamentId
}

export function useMatchesData(): MatchesDataState {
  const tournamentId = useActiveTournamentId()
  const { data, loading, refreshing, error, reload, refresh } = useTournamentResource(
    tournamentId,
    fetchMatchesData,
    EMPTY_MATCHES_DATA,
    'Error al cargar datos',
  )

  const handleDeleteMatch = useCallback(
    async (id: string) => {
      await deleteMatch(requireTournament(tournamentId), id)
      await reload()
    },
    [tournamentId, reload],
  )

  const handleAddMatch = useCallback(
    async (m: MatchInput) => {
      const matchId = await createMatch(requireTournament(tournamentId), m)
      await reload()
      return matchId
    },
    [tournamentId, reload],
  )

  const handleUpdateMatch = useCallback(
    async (id: string, m: MatchInput) => {
      await updateMatch(requireTournament(tournamentId), id, m)
      await reload()
    },
    [tournamentId, reload],
  )

  const handleUpdateMatchPositions = useCallback(
    async (id: string, positions: Record<string, PitchPosition>) => {
      await updateMatchPlayerPositions(requireTournament(tournamentId), id, positions)
      await reload()
    },
    [tournamentId, reload],
  )

  return {
    ...data,
    loading,
    refreshing,
    error,
    reload,
    refresh,
    deleteMatch: handleDeleteMatch,
    addMatch: handleAddMatch,
    updateMatch: handleUpdateMatch,
    updateMatchPositions: handleUpdateMatchPositions,
  }
}
