import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore/lite'
import type { Match, Player } from '@fulbito/types'
import { docToPlayer } from './players'
import { docToMatchScalars, groupTeamsByMatch } from './matches'

export async function getPlayersServer(): Promise<Player[]> {
  const db = getFirestore()
  const snap = await getDocs(query(collection(db, 'players'), orderBy('skill', 'desc')))
  return snap.docs.map(d => docToPlayer(d.id, d.data()))
}

export async function getMatchesServer(): Promise<Match[]> {
  const db = getFirestore()
  const [matchSnap, mpSnap, playerSnap] = await Promise.all([
    getDocs(query(collection(db, 'matches'), orderBy('date', 'desc'))),
    getDocs(collection(db, 'matchPlayers')),
    getDocs(collection(db, 'players')),
  ])

  const playerNames = new Map<string, string>(
    playerSnap.docs.map(d => [d.id, d.data()['name'] as string]),
  )

  const mpDocs = mpSnap.docs.map(d => ({ id: d.id, data: () => d.data() as Record<string, unknown> }))
  const teamsByMatch = groupTeamsByMatch(mpDocs, playerNames)

  return matchSnap.docs.map(d => {
    const scalars = docToMatchScalars(d.id, d.data() as Record<string, unknown>)
    const teams = teamsByMatch.get(d.id) ?? { A: [], B: [] }
    return { ...scalars, teamA: teams.A, teamB: teams.B }
  })
}
