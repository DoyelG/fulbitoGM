import type { Match, Player } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'

import { deletePlayerRequest, loadPlayersAndMatches } from '@/lib/api'

export type PlayersDataState = {
  players: Player[]
  matches: Match[]
  loading: boolean
  refreshing: boolean
  error: string | null
  reload: () => Promise<void>
  refresh: () => Promise<void>
  deletePlayer: (id: string) => Promise<void>
}

export function usePlayersData(): PlayersDataState {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      const data = await loadPlayersAndMatches()
      setPlayers(data.players)
      setMatches(data.matches)
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

  const deletePlayer = useCallback(
    async (id: string) => {
      await deletePlayerRequest(id)
      await reload()
    },
    [reload],
  )

  useEffect(() => {
    void reload()
  }, [reload])

  return { players, matches, loading, refreshing, error, reload, refresh, deletePlayer }
}
