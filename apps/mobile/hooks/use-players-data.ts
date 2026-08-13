import type { Match, MatchPlayer, Player } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'
import {
  collection, doc, getDocs, deleteDoc,
  query, orderBy, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { shapeStorePlayers } from '@/lib/shape'

function docToPlayer(id: string, data: Record<string, any>): Player {
  return {
    id,
    name: data.name,
    position: data.position,
    skill: data.skill ?? null,
    skills: data.skills,
    photoUrl: data.photoUrl,
    goalkeeping: data.goalkeeping ?? undefined,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  }
}

function docToMatch(
  id: string,
  data: Record<string, any>,
  teams: { A: MatchPlayer[]; B: MatchPlayer[] },
): Match {
  return {
    id,
    date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
    type: data.type,
    name: data.name ?? undefined,
    teamAScore: data.teamAScore,
    teamBScore: data.teamBScore,
    teamA: teams.A,
    teamB: teams.B,
    shirtsResponsibleId: data.shirtsResponsibleId ?? null,
    mvpId: data.mvpId ?? null,
    goalkeeperIds: data.goalkeeperIds ?? [],
  }
}

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
      const [playerSnap, matchSnap, mpSnap] = await Promise.all([
        getDocs(query(collection(db, 'players'), orderBy('skill', 'desc'))),
        getDocs(query(collection(db, 'matches'), orderBy('date', 'desc'))),
        getDocs(collection(db, 'matchPlayers')),
      ])
      const rawPlayers = playerSnap.docs.map(d => docToPlayer(d.id, d.data() as Record<string, any>))
      const playerNames = new Map<string, string>(rawPlayers.map(p => [p.id, p.name]))

      const teamsByMatch = new Map<string, { A: MatchPlayer[]; B: MatchPlayer[] }>()
      for (const d of mpSnap.docs) {
        const mp = d.data()
        if (!teamsByMatch.has(mp.matchId)) teamsByMatch.set(mp.matchId, { A: [], B: [] })
        const entry: MatchPlayer = {
          id: mp.playerId,
          name: playerNames.get(mp.playerId) ?? '',
          goals: mp.goals,
          performance: mp.performance,
        }
        teamsByMatch.get(mp.matchId)![mp.team as 'A' | 'B'].push(entry)
      }

      setPlayers(shapeStorePlayers(rawPlayers))
      setMatches(
        matchSnap.docs.map(d =>
          docToMatch(d.id, d.data() as Record<string, any>, teamsByMatch.get(d.id) ?? { A: [], B: [] }),
        ),
      )
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

  const deletePlayer = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'players', id))
    await reload()
  }, [reload])

  useEffect(() => { void reload() }, [reload])

  return { players, matches, loading, refreshing, error, reload, refresh, deletePlayer }
}
