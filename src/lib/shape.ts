import { prisma } from '@/lib/prisma'
import type { Player as StorePlayer } from '@/store/usePlayerStore'
import type { Match as StoreMatch } from '@/store/useMatchStore'

export function shapeStorePlayers(players: Array<{ id: string; name: string; position: string; skill: number | null; skills?: unknown; photoUrl?: string | null; createdAt: Date; updatedAt: Date }>): StorePlayer[] {
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    position: p.position,
    skill: p.skill ?? null,
    skills: p.skills as StorePlayer['skills'],
    photoUrl: p.photoUrl ?? undefined,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))
}

export function shapeStoreMatches(matches: Array<{ id: string; date: Date; type: string; name: string | null; teamAScore: number; teamBScore: number; players: Array<{ playerId: string; team: 'A' | 'B'; goals: number; performance: number }> }>, nameMap: Map<string, string>): StoreMatch[] {
  return matches.map((m) => ({
    id: m.id,
    date: m.date.toISOString().slice(0, 10),
    type: m.type,
    name: m.name ?? undefined,
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

export async function loadPlayersAndMatches(): Promise<{ players: StorePlayer[]; matches: StoreMatch[] }> {
  const [players, matches] = await Promise.all([
    prisma.player.findMany({ orderBy: { name: 'asc' } }),
    prisma.match.findMany({ orderBy: { date: 'desc' }, include: { players: true } }),
  ])
  const nameMap = new Map(players.map((p) => [p.id, p.name] as const))
  const shapedPlayers = shapeStorePlayers(players)
  const shapedMatches = shapeStoreMatches(matches.map(m => ({ ...m, players: m.players.map(mp => ({ playerId: mp.playerId, team: mp.team as 'A' | 'B', goals: mp.goals, performance: mp.performance })) })), nameMap)
  return { players: shapedPlayers, matches: shapedMatches }
}
