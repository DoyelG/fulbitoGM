import { getFirestore, collection, doc, getDocs, getDoc, writeBatch, query, where, Timestamp } from 'firebase/firestore'
import type { Match, MatchInput, MatchPlayer } from '@fulbito/types'

type Teams = { A: MatchPlayer[]; B: MatchPlayer[] }

function groupTeamsByMatch(
  mpDocs: Array<{ id: string; data: () => Record<string, unknown> }>,
  playerNames: Map<string, string>,
): Map<string, Teams> {
  const byMatch = new Map<string, Teams>()
  for (const d of mpDocs) {
    const mp = d.data()
    const matchId = mp['matchId'] as string
    let teams = byMatch.get(matchId)
    if (!teams) {
      teams = { A: [], B: [] }
      byMatch.set(matchId, teams)
    }
    const entry: MatchPlayer = {
      id: mp['playerId'] as string,
      name: playerNames.get(mp['playerId'] as string) ?? '',
      goals: (mp['goals'] as number) ?? 0,
      performance: (mp['performance'] as number) ?? 0,
    }
    teams[mp['team'] as 'A' | 'B'].push(entry)
  }
  return byMatch
}

function docToMatchScalars(id: string, data: Record<string, unknown>): Omit<Match, 'teamA' | 'teamB'> {
  return {
    id,
    date: data['date'] instanceof Timestamp ? data['date'].toDate().toISOString() : (data['date'] as string),
    createdAt: data['createdAt'] instanceof Timestamp ? data['createdAt'].toDate().toISOString() : ((data['createdAt'] as string | undefined) ??
        (data['date'] instanceof Timestamp ? data['date'].toDate().toISOString() : (data['date'] as string))),
    updatedAt: data['updatedAt'] instanceof Timestamp ? data['updatedAt'].toDate().toISOString() : ((data['updatedAt'] as string | undefined) ??
        (data['date'] instanceof Timestamp ? data['date'].toDate().toISOString() : (data['date'] as string))),
    type: data['type'] as string,
    status: data['status'] === 'draft' ? 'draft' : 'final',
    name: (data['name'] as string | undefined) ?? undefined,
    description: (data['description'] as string | undefined) ?? undefined,
    teamAScore: data['teamAScore'] as number,
    teamBScore: data['teamBScore'] as number,
    shirtsResponsibleId: (data['shirtsResponsibleId'] as string | null) ?? null,
    mvpId: (data['mvpId'] as string | null) ?? null,
    goalkeeperIds: (data['goalkeeperIds'] as string[]) ?? [],
    isFriendly: (data['isFriendly'] as boolean) ?? false,
  }
}

export async function getMatches(): Promise<Match[]> {
  const db = getFirestore()
  const [matchSnap, mpSnap, playerSnap] = await Promise.all([
    getDocs(collection(db, 'matches')),
    getDocs(collection(db, 'matchPlayers')),
    getDocs(collection(db, 'players')),
  ])

  const playerNames = new Map<string, string>(playerSnap.docs.map((d) => [d.id, d.data()['name'] as string]))

  const mpDocs = mpSnap.docs.map((d) => ({ id: d.id, data: () => d.data() as Record<string, unknown> }))
  const teamsByMatch = groupTeamsByMatch(mpDocs, playerNames)

  const matches = matchSnap.docs.map((d) => {
    const scalars = docToMatchScalars(d.id, d.data() as Record<string, unknown>)
    const teams = teamsByMatch.get(d.id) ?? { A: [], B: [] }
    return { ...scalars, teamA: teams.A, teamB: teams.B }
  })

  return sortMatchesByDateDescending(matches)
}

function sortMatchesByDateDescending(matches: Match[]): Match[] {
  return matches.sort((a, b) => {
    const dayA = a.date.slice(0, 10)
    const dayB = b.date.slice(0, 10)
    if (dayA !== dayB) return dayB.localeCompare(dayA)
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export async function getMatch(id: string): Promise<Match | null> {
  const db = getFirestore()
  const [matchSnap, mpSnap, playerSnap] = await Promise.all([
    getDoc(doc(db, 'matches', id)),
    getDocs(query(collection(db, 'matchPlayers'), where('matchId', '==', id))),
    getDocs(collection(db, 'players')),
  ])

  if (!matchSnap.exists()) return null

  const playerNames = new Map<string, string>(playerSnap.docs.map((d) => [d.id, d.data()['name'] as string]))

  const mpDocs = mpSnap.docs.map((d) => ({ id: d.id, data: () => d.data() as Record<string, unknown> }))
  const scalars = docToMatchScalars(matchSnap.id, matchSnap.data() as Record<string, unknown>)
  const teams = groupTeamsByMatch(mpDocs, playerNames).get(id) ?? { A: [], B: [] }
  return { ...scalars, teamA: teams.A, teamB: teams.B }
}

export async function createMatch(data: MatchInput): Promise<string> {
  const db = getFirestore()
  const { teamA, teamB, mvpId, goalkeeperIds, ...scalars } = data

  const batch = writeBatch(db)
  const matchRef = doc(collection(db, 'matches'))
  batch.set(matchRef, {
    ...scalars,
    date: Timestamp.fromDate(new Date(data.date)),
    status: data.status ?? 'final',
    name: data.name ?? null,
    description: data.description ?? null,
    mvpId: mvpId ?? null,
    goalkeeperIds: goalkeeperIds ?? [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })

  const allPlayers = [
    ...teamA.map((p) => ({ ...p, team: 'A' as const })),
    ...teamB.map((p) => ({ ...p, team: 'B' as const })),
  ]
  for (const p of allPlayers) {
    batch.set(doc(collection(db, 'matchPlayers')), {
      matchId: matchRef.id,
      playerId: p.id,
      team: p.team,
      goals: p.goals,
      performance: p.performance,
    })
  }

  await batch.commit()
  return matchRef.id
}

export async function updateMatch(id: string, data: MatchInput): Promise<void> {
  const db = getFirestore()
  const { teamA, teamB, mvpId, goalkeeperIds, ...scalars } = data

  const mpSnap = await getDocs(query(collection(db, 'matchPlayers'), where('matchId', '==', id)))
  const toDelete = mpSnap.docs

  const batch = writeBatch(db)
  batch.update(doc(db, 'matches', id), {
    ...scalars,
    date: Timestamp.fromDate(new Date(data.date)),
    description: data.description ?? null,
    mvpId: mvpId ?? null,
    goalkeeperIds: goalkeeperIds ?? [],
    updatedAt: Timestamp.now(),
  })
  for (const d of toDelete) batch.delete(d.ref)

  const allPlayers = [
    ...teamA.map((p) => ({ ...p, team: 'A' as const })),
    ...teamB.map((p) => ({ ...p, team: 'B' as const })),
  ]
  for (const p of allPlayers) {
    batch.set(doc(collection(db, 'matchPlayers')), {
      matchId: id,
      playerId: p.id,
      team: p.team,
      goals: p.goals,
      performance: p.performance,
    })
  }

  await batch.commit()
}

export async function deleteMatch(id: string): Promise<void> {
  const db = getFirestore()

  const mpSnap = await getDocs(query(collection(db, 'matchPlayers'), where('matchId', '==', id)))
  const toDelete = mpSnap.docs

  const batch = writeBatch(db)
  batch.delete(doc(db, 'matches', id))
  for (const d of toDelete) batch.delete(d.ref)
  await batch.commit()
}
