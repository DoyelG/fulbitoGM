import { getFirestore, collection, doc, getDocs, getDoc, writeBatch, query, where, Timestamp } from 'firebase/firestore'
import type { Match, MatchInput, MatchPlayer, MatchLocation } from '@fulbito/types'
import { tournamentPlayersQuery } from './players'

type Teams = { A: MatchPlayer[]; B: MatchPlayer[] }

const MATCHES_COLLECTION = 'matches'
const MATCH_PLAYERS_COLLECTION = 'matchPlayers'

function isTimestampLike(value: unknown): value is { toDate(): Date } {
  return typeof value === 'object' && value !== null && typeof (value as { toDate?: unknown }).toDate === 'function'
}

export function groupTeamsByMatch(
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

function parseLocation(raw: unknown): MatchLocation | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  return {
    name: data['name'] as string,
    street: data['street'] as string,
    addressId: data['addressId'] as string,
  }
}

function toIsoString(value: unknown): string | undefined {
  if (isTimestampLike(value)) return value.toDate().toISOString()
  return typeof value === 'string' ? value : undefined
}

export function docToMatchScalars(id: string, data: Record<string, unknown>): Omit<Match, 'teamA' | 'teamB'> {
  const date = toIsoString(data['date']) ?? (data['date'] as string)

  return {
    id,
    tournamentId: typeof data['tournamentId'] === 'string' ? data['tournamentId'] : '',
    date,
    hasTime: (data['hasTime'] as boolean | undefined) ?? false,
    createdAt: toIsoString(data['createdAt']) ?? date,
    updatedAt: toIsoString(data['updatedAt']) ?? date,
    type: data['type'] as string,
    status: data['status'] === 'draft' ? 'draft' : 'final',
    name: (data['name'] as string | undefined) ?? undefined,
    location: parseLocation(data['location']),
    description: (data['description'] as string | undefined) ?? undefined,
    teamAScore: data['teamAScore'] as number,
    teamBScore: data['teamBScore'] as number,
    shirtsResponsibleId: (data['shirtsResponsibleId'] as string | null) ?? null,
    mvpId: (data['mvpId'] as string | null) ?? null,
    goalkeeperIds: (data['goalkeeperIds'] as string[]) ?? [],
    isFriendly: (data['isFriendly'] as boolean) ?? false,
  }
}

function tournamentQuery(collectionName: string, tournamentId: string) {
  return query(collection(getFirestore(), collectionName), where('tournamentId', '==', tournamentId))
}

function matchPlayersQuery(tournamentId: string, matchId: string) {
  return query(
    collection(getFirestore(), MATCH_PLAYERS_COLLECTION),
    where('tournamentId', '==', tournamentId),
    where('matchId', '==', matchId),
  )
}

async function getPlayerNames(tournamentId: string): Promise<Map<string, string>> {
  const playerSnap = await getDocs(tournamentPlayersQuery(tournamentId))
  return new Map<string, string>(playerSnap.docs.map((d) => [d.id, d.data()['name'] as string]))
}

export async function getMatches(tournamentId: string): Promise<Match[]> {
  const [matchSnap, mpSnap, playerNames] = await Promise.all([
    getDocs(tournamentQuery(MATCHES_COLLECTION, tournamentId)),
    getDocs(tournamentQuery(MATCH_PLAYERS_COLLECTION, tournamentId)),
    getPlayerNames(tournamentId),
  ])

  const mpDocs = mpSnap.docs.map((d) => ({ id: d.id, data: () => d.data() as Record<string, unknown> }))
  const teamsByMatch = groupTeamsByMatch(mpDocs, playerNames)

  const matches = matchSnap.docs.map((d) => {
    const scalars = docToMatchScalars(d.id, d.data() as Record<string, unknown>)
    const teams = teamsByMatch.get(d.id) ?? { A: [], B: [] }
    return { ...scalars, teamA: teams.A, teamB: teams.B }
  })

  return sortMatchesByDateDescending(matches)
}

export async function getDraftMatches(tournamentId: string): Promise<Omit<Match, 'teamA' | 'teamB'>[]> {
  const snap = await getDocs(
    query(
      collection(getFirestore(), MATCHES_COLLECTION),
      where('tournamentId', '==', tournamentId),
      where('status', '==', 'draft'),
    ),
  )
  return snap.docs.map((d) => docToMatchScalars(d.id, d.data() as Record<string, unknown>))
}

function sortMatchesByDateDescending(matches: Match[]): Match[] {
  return matches.sort((a, b) => {
    const dayA = a.date.slice(0, 10)
    const dayB = b.date.slice(0, 10)
    if (dayA !== dayB) return dayB.localeCompare(dayA)
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export async function getMatch(tournamentId: string, id: string): Promise<Match | null> {
  const db = getFirestore()
  const [matchSnap, mpSnap, playerNames] = await Promise.all([
    getDoc(doc(db, MATCHES_COLLECTION, id)),
    getDocs(matchPlayersQuery(tournamentId, id)),
    getPlayerNames(tournamentId),
  ])

  if (!matchSnap.exists()) return null

  const mpDocs = mpSnap.docs.map((d) => ({ id: d.id, data: () => d.data() as Record<string, unknown> }))
  const scalars = docToMatchScalars(matchSnap.id, matchSnap.data() as Record<string, unknown>)
  const teams = groupTeamsByMatch(mpDocs, playerNames).get(id) ?? { A: [], B: [] }
  return { ...scalars, teamA: teams.A, teamB: teams.B }
}

function matchPlayerRows(teamA: MatchPlayer[], teamB: MatchPlayer[]) {
  return [...teamA.map((p) => ({ ...p, team: 'A' as const })), ...teamB.map((p) => ({ ...p, team: 'B' as const }))]
}

export async function createMatch(tournamentId: string, data: MatchInput): Promise<string> {
  const db = getFirestore()
  const { teamA, teamB, mvpId, goalkeeperIds, ...scalars } = data

  const batch = writeBatch(db)
  const matchRef = doc(collection(db, MATCHES_COLLECTION))
  batch.set(matchRef, {
    ...scalars,
    tournamentId,
    date: Timestamp.fromDate(new Date(data.date)),
    status: data.status ?? 'final',
    name: data.name ?? null,
    location: data.location ?? null,
    description: data.description ?? null,
    mvpId: mvpId ?? null,
    goalkeeperIds: goalkeeperIds ?? [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })

  for (const p of matchPlayerRows(teamA, teamB)) {
    batch.set(doc(collection(db, MATCH_PLAYERS_COLLECTION)), {
      tournamentId,
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

export async function updateMatch(tournamentId: string, id: string, data: MatchInput): Promise<void> {
  const db = getFirestore()
  const { teamA, teamB, mvpId, goalkeeperIds, ...scalars } = data

  const mpSnap = await getDocs(matchPlayersQuery(tournamentId, id))

  const batch = writeBatch(db)
  batch.update(doc(db, MATCHES_COLLECTION, id), {
    ...scalars,
    date: Timestamp.fromDate(new Date(data.date)),
    location: data.location ?? null,
    description: data.description ?? null,
    mvpId: mvpId ?? null,
    goalkeeperIds: goalkeeperIds ?? [],
    updatedAt: Timestamp.now(),
  })
  for (const d of mpSnap.docs) batch.delete(d.ref)

  for (const p of matchPlayerRows(teamA, teamB)) {
    batch.set(doc(collection(db, MATCH_PLAYERS_COLLECTION)), {
      tournamentId,
      matchId: id,
      playerId: p.id,
      team: p.team,
      goals: p.goals,
      performance: p.performance,
    })
  }

  await batch.commit()
}

export async function deleteMatch(tournamentId: string, id: string): Promise<void> {
  const db = getFirestore()

  const mpSnap = await getDocs(matchPlayersQuery(tournamentId, id))

  const batch = writeBatch(db)
  batch.delete(doc(db, MATCHES_COLLECTION, id))
  for (const d of mpSnap.docs) batch.delete(d.ref)
  await batch.commit()
}
