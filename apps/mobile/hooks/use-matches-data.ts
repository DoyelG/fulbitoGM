import type { Match, Player } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'
import { getMatches, getPlayers, createMatch, updateMatch, deleteMatch } from '@fulbito/firebase'
import { shapeStorePlayers } from '@/lib/shape'

async function fetchMatchesAndPlayers(): Promise<{ matches: Match[]; players: Player[] }> {
  const [rawMatches, rawPlayers] = await Promise.all([getMatches(), getPlayers()])
  return {
    matches: rawMatches,
    players: shapeStorePlayers(rawPlayers),
  }
}

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
      const data = await fetchMatchesAndPlayers()
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

  const handleDeleteMatch = useCallback(
    async (id: string) => {
      await deleteMatch(id)
      await reload()
    },
    [reload],
  )

  const handleAddMatch = useCallback(
    async (m: Omit<Match, 'id'>) => {
      await createMatch(m)
      await reload()
    },
    [reload],
  )

  const handleUpdateMatch = useCallback(
    async (id: string, m: Omit<Match, 'id'>) => {
      await updateMatch(id, m)
      await reload()
    },
    [reload],
  )

  useEffect(() => {
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
