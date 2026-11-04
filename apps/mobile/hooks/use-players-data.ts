import type { Match, Player } from '@fulbito/types'
import { useCallback } from 'react'
import { getPlayers, getMatches, deletePlayer } from '@fulbito/firebase'

import { useActiveTournamentId } from '@/contexts/TournamentContext'
import { useTournamentResource } from '@/hooks/use-tournament-resource'

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

type PlayersData = { players: Player[]; matches: Match[] }

const EMPTY_PLAYERS_DATA: PlayersData = { players: [], matches: [] }

async function fetchPlayersData(tournamentId: string): Promise<PlayersData> {
  const [players, matches] = await Promise.all([getPlayers(tournamentId), getMatches(tournamentId)])
  return { players, matches }
}

export function usePlayersData(): PlayersDataState {
  const tournamentId = useActiveTournamentId()
  const { data, loading, refreshing, error, reload, refresh } = useTournamentResource(
    tournamentId,
    fetchPlayersData,
    EMPTY_PLAYERS_DATA,
    'Error al cargar datos',
  )

  const handleDeletePlayer = useCallback(
    async (id: string) => {
      await deletePlayer(id)
      await reload()
    },
    [reload],
  )

  return { ...data, loading, refreshing, error, reload, refresh, deletePlayer: handleDeletePlayer }
}
