import type { Match, Player } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'

import { loadPlayersAndMatches } from '@/lib/api'
import { addMatchRequest, deleteMatchRequest, updateMatchRequest } from '@/lib/matchesApi'

export type MatchesDataState = {
  matches: Match[]
  players: Player[]
  loading: boolean
  refreshing: boolean
  error: string | null
  reload: () => Promise<void>
  refresh: () => Promise<void>
  deleteMatch: (id: string) => Promise<void>
  addMatch: (m: Omit<Match, 'id'>) => Promise<void>
  updateMatch: (id: string, m: Omit<Match, 'id'>) => Promise<void>
}

export function useMatchesData(): MatchesDataState {
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      const data = await loadPlayersAndMatches()
      setMatches(data.matches)
      setPlayers(data.players)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await reload()
  }, [reload])

  const deleteMatch = useCallback(
    async (id: string) => {
      await deleteMatchRequest(id)
      await reload()
    },
    [reload],
  )

  const addMatch = useCallback(
    async (m: Omit<Match, 'id'>) => {
      await addMatchRequest(m)
      await reload()
    },
    [reload],
  )

  const updateMatch = useCallback(
    async (id: string, m: Omit<Match, 'id'>) => {
      await updateMatchRequest(id, m)
      await reload()
    },
    [reload],
  )

  useEffect(() => {
    void reload()
  }, [reload])

  return { matches, players, loading, refreshing, error, reload, refresh, deleteMatch, addMatch, updateMatch }
}
