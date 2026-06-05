import type { Match, MatchPlayer, Player } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { shapeStorePlayers } from '@/lib/shape'

async function fetchMatchesAndPlayers(): Promise<{ matches: Match[]; players: Player[] }> {
  const [matchSnap, mpSnap, playerSnap] = await Promise.all([
    getDocs(query(collection(db, 'matches'), orderBy('date', 'desc'))),
    getDocs(collection(db, 'matchPlayers')),
    getDocs(query(collection(db, 'players'), orderBy('skill', 'desc'))),
  ])

  const playerNames = new Map<string, string>(
    playerSnap.docs.map(d => [d.id, d.data().name as string]),
  )

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

  const matches = matchSnap.docs.map(d => {
    const data: DocumentData = d.data()
    const teams = teamsByMatch.get(d.id) ?? { A: [], B: [] }
    return {
      id: d.id,
      date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
      type: data.type,
      name: data.name ?? undefined,
      teamAScore: data.teamAScore,
      teamBScore: data.teamBScore,
      teamA: teams.A,
      teamB: teams.B,
      shirtsResponsibleId: data.shirtsResponsibleId ?? null,
      mvpId: data.mvpId ?? null,
    } as Match
  })

  const rawPlayers = playerSnap.docs.map(d => ({
    id: d.id,
    ...(d.data() as DocumentData),
  }))
  const players = shapeStorePlayers(rawPlayers as Parameters<typeof shapeStorePlayers>[0])

  return { matches, players }
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

  const deleteMatch = useCallback(
    async (id: string) => {
      await deleteDoc(doc(db, 'matches', id))
      const mpSnap = await getDocs(collection(db, 'matchPlayers'))
      await Promise.all(mpSnap.docs.filter(d => d.data().matchId === id).map(d => deleteDoc(d.ref)))
      await reload()
    },
    [reload],
  )

  const addMatch = useCallback(
    async (m: Omit<Match, 'id'>) => {
      const { teamA, teamB, mvpId, ...rest } = m
      const ref = await addDoc(collection(db, 'matches'), {
        ...rest,
        mvpId: mvpId ?? null,
        date: Timestamp.fromDate(new Date(m.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      const allPlayers = [
        ...teamA.map(p => ({ ...p, team: 'A' })),
        ...teamB.map(p => ({ ...p, team: 'B' })),
      ]
      await Promise.all(
        allPlayers.map(p =>
          addDoc(collection(db, 'matchPlayers'), {
            matchId: ref.id,
            playerId: p.id,
            team: p.team,
            goals: p.goals,
            performance: p.performance,
          }),
        ),
      )
      await reload()
    },
    [reload],
  )

  const updateMatch = useCallback(
    async (id: string, m: Omit<Match, 'id'>) => {
      const { teamA, teamB, mvpId, ...rest } = m
      await updateDoc(doc(db, 'matches', id), {
        ...rest,
        mvpId: mvpId ?? null,
        date: Timestamp.fromDate(new Date(m.date)),
        updatedAt: Timestamp.now(),
      })
      const existing = await getDocs(collection(db, 'matchPlayers'))
      const toDelete = existing.docs.filter(d => d.data().matchId === id)
      await Promise.all(toDelete.map(d => deleteDoc(d.ref)))
      const allPlayers = [
        ...teamA.map(p => ({ ...p, team: 'A' })),
        ...teamB.map(p => ({ ...p, team: 'B' })),
      ]
      await Promise.all(
        allPlayers.map(p =>
          addDoc(collection(db, 'matchPlayers'), {
            matchId: id,
            playerId: p.id,
            team: p.team,
            goals: p.goals,
            performance: p.performance,
          }),
        ),
      )
      await reload()
    },
    [reload],
  )

  useEffect(() => {
    void reload()
  }, [reload])

  return { matches, players, loading, refreshing, error, reload, refresh, deleteMatch, addMatch, updateMatch }
}
