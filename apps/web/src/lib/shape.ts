import type { Match, Player } from '@fulbito/types'
import { getBackendBaseUrl } from '@/lib/backend'

export function shapeStorePlayers(players: Array<{ id: string; name: string; position: string; skill: number | null; skills?: unknown; photoUrl?: string | null; createdAt: Date | string; updatedAt: Date | string }>): Player[] {
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    position: p.position,
    skill: p.skill ?? null,
    skills: p.skills as Player['skills'],
    photoUrl: p.photoUrl ?? undefined,
    shirtDutiesCount: (p as unknown as { shirtDutiesCount?: number }).shirtDutiesCount ?? 0,
    createdAt: p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt),
  }))
}

export function shapeStoreMatches(matches: Array<{ id: string; date: Date; type: string; name: string | null; teamAScore: number; teamBScore: number; shirtsResponsibleId?: string | null; players: Array<{ playerId: string; team: 'A' | 'B'; goals: number; performance: number }> }>, nameMap: Map<string, string>): Match[] {
  return matches.map((m) => ({
    id: m.id,
    date: m.date.toISOString().slice(0, 10),
    type: m.type,
    name: m.name ?? undefined,
    shirtsResponsibleId: m.shirtsResponsibleId ?? undefined,
    teamAScore: m.teamAScore,
    teamBScore: m.teamBScore,
    teamA: m.players
      .filter((p) => p.team === 'A')
      .map((p) => ({ id: p.playerId, name: nameMap.get(p.playerId) || '', goals: p.goals, performance: p.performance })),
    teamB: m.players
      .filter((p) => p.team === 'B')
      .map((p) => ({ id: p.playerId, name: nameMap.get(p.playerId) || '', goals: p.goals, performance: p.performance })),
  }))
}

export async function loadPlayersAndMatches(): Promise<{ players: Player[]; matches: Match[] }> {
  const base = getBackendBaseUrl()
  const [playersRes, matchesRes] = await Promise.all([
    fetch(`${base}/api/players`, { cache: 'no-store' }),
    fetch(`${base}/api/matches`, { cache: 'no-store' }),
  ])
  const players = await playersRes.json()
  const matches = await matchesRes.json()

  // `GET /api/matches` already returns store-shaped matches (with names)
  const shapedPlayers = shapeStorePlayers(players)
  return { players: shapedPlayers, matches }
}
