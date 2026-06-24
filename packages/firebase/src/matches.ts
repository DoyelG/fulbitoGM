import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import type { Match, MatchPlayer } from '@fulbito/types'

function buildTeams(
  matchId: string,
  mpDocs: Array<{ id: string; data: () => Record<string, unknown> }>,
  playerNames: Map<string, string>,
): { A: MatchPlayer[]; B: MatchPlayer[] } {
  const teams: { A: MatchPlayer[]; B: MatchPlayer[] } = { A: [], B: [] }
  for (const d of mpDocs) {
    const mp = d.data()
    if (mp['matchId'] !== matchId) continue
    const entry: MatchPlayer = {
      id: mp['playerId'] as string,
      name: playerNames.get(mp['playerId'] as string) ?? '',
      goals: (mp['goals'] as number) ?? 0,
      performance: (mp['performance'] as number) ?? 0,
    }
    const team = mp['team'] as 'A' | 'B'
    teams[team].push(entry)
  }
  return teams
}

function docToMatchScalars(id: string, data: Record<string, unknown>): Omit<Match, 'teamA' | 'teamB'> {
  return {
    id,
    date: data['date'] instanceof Timestamp ? data['date'].toDate().toISOString() : (data['date'] as string),
    type: data['type'] as string,
    status: data['status'] === 'draft' ? 'draft' : 'final',
    name: (data['name'] as string | undefined) ?? undefined,
    teamAScore: data['teamAScore'] as number,
    teamBScore: data['teamBScore'] as number,
    shirtsResponsibleId: (data['shirtsResponsibleId'] as string | null) ?? null,
    mvpId: (data['mvpId'] as string | null) ?? null,
    goalkeeperIds: (data['goalkeeperIds'] as string[]) ?? [],
  }
}

export async function getMatches(): Promise<Match[]> {
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

  return matchSnap.docs.map(d => {
    const scalars = docToMatchScalars(d.id, d.data() as Record<string, unknown>)
    const { A, B } = buildTeams(d.id, mpDocs, playerNames)
    return { ...scalars, teamA: A, teamB: B }
  })
}

export async function getMatch(id: string): Promise<Match | null> {
  const db = getFirestore()
  const [matchSnap, mpSnap, playerSnap] = await Promise.all([
    getDoc(doc(db, 'matches', id)),
    getDocs(collection(db, 'matchPlayers')),
    getDocs(collection(db, 'players')),
  ])

  if (!matchSnap.exists()) return null

  const playerNames = new Map<string, string>(
    playerSnap.docs.map(d => [d.id, d.data()['name'] as string]),
  )

  const mpDocs = mpSnap.docs.map(d => ({ id: d.id, data: () => d.data() as Record<string, unknown> }))
  const scalars = docToMatchScalars(matchSnap.id, matchSnap.data() as Record<string, unknown>)
  const { A, B } = buildTeams(id, mpDocs, playerNames)
  return { ...scalars, teamA: A, teamB: B }
}

export async function createMatch(data: Omit<Match, 'id'>): Promise<string> {
  const db = getFirestore()
  const { teamA, teamB, mvpId, goalkeeperIds, ...scalars } = data
  const matchRef = await addDoc(collection(db, 'matches'), {
    ...scalars,
    date: Timestamp.fromDate(new Date(data.date)),
    status: data.status ?? 'final',
    name: data.name ?? null,
    mvpId: mvpId ?? null,
    goalkeeperIds: goalkeeperIds ?? [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })

  const allPlayers = [
    ...teamA.map(p => ({ ...p, team: 'A' as const })),
    ...teamB.map(p => ({ ...p, team: 'B' as const })),
  ]
  await Promise.all(
    allPlayers.map(p =>
      addDoc(collection(db, 'matchPlayers'), {
        matchId: matchRef.id,
        playerId: p.id,
        team: p.team,
        goals: p.goals,
        performance: p.performance,
      }),
    ),
  )

  return matchRef.id
}

export async function updateMatch(id: string, data: Omit<Match, 'id'>): Promise<void> {
  const db = getFirestore()
  const { teamA, teamB, mvpId, goalkeeperIds, ...scalars } = data
  await updateDoc(doc(db, 'matches', id), {
    ...scalars,
    date: Timestamp.fromDate(new Date(data.date)),
    mvpId: mvpId ?? null,
    goalkeeperIds: goalkeeperIds ?? [],
    updatedAt: Timestamp.now(),
  })

  // Delete all existing matchPlayers for this match, then re-insert
  const mpSnap = await getDocs(collection(db, 'matchPlayers'))
  const toDelete = mpSnap.docs.filter(d => (d.data() as Record<string, unknown>)['matchId'] === id)
  await Promise.all(toDelete.map(d => deleteDoc(d.ref)))

  const allPlayers = [
    ...teamA.map(p => ({ ...p, team: 'A' as const })),
    ...teamB.map(p => ({ ...p, team: 'B' as const })),
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
}

export async function deleteMatch(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'matches', id))

  // Cascade: delete associated matchPlayers
  const mpSnap = await getDocs(collection(db, 'matchPlayers'))
  const toDelete = mpSnap.docs.filter(d => (d.data() as Record<string, unknown>)['matchId'] === id)
  await Promise.all(toDelete.map(d => deleteDoc(d.ref)))
}
