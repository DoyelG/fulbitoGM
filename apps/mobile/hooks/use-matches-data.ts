import type { Match, MatchInput, Player } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'
import { getMatches, getPlayers, createMatch, updateMatch, deleteMatch } from '@fulbito/firebase'

import { useActiveTournamentId } from '@/contexts/TournamentContext'

export type MatchesDataState = {
  matches: Match[]
  players: Player[]
  loading: boolean
  refreshing: boolean
  error: string | null
  reload: () => Promise<void>
  refresh: () => Promise<void>
  deleteMatch: (id: string) => Promise<void>
  addMatch: (m: MatchInput) => Promise<void>
  updateMatch: (id: string, m: MatchInput) => Promise<void>
}

function requireTournament(tournamentId: string | null): string {
  if (!tournamentId) throw new Error('No hay un torneo activo')
  return tournamentId
}

export function useMatchesData(): MatchesDataState {
  const tournamentId = useActiveTournamentId()
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!tournamentId) return
    setError(null)
    try {
      const [nextMatches, nextPlayers] = await Promise.all([getMatches(tournamentId), getPlayers(tournamentId)])
      setMatches(nextMatches)
      setPlayers(nextPlayers)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [tournamentId])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await reload()
  }, [reload])

  const handleDeleteMatch = useCallback(
    async (id: string) => {
      await deleteMatch(requireTournament(tournamentId), id)
      await reload()
    },
    [tournamentId, reload],
  )

  const handleAddMatch = useCallback(
    async (m: MatchInput) => {
      await createMatch(requireTournament(tournamentId), m)
      await reload()
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

  useEffect(() => {
    setMatches([])
    setPlayers([])
    setLoading(true)
    void reload()
  }, [reload])

  return {
    matches,
    players,
    loading,
    refreshing,
    error,
    reload,
    refresh,
    deleteMatch: handleDeleteMatch,
    addMatch: handleAddMatch,
    updateMatch: handleUpdateMatch,
  }
}
