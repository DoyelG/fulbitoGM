import type { Match as StoreMatch } from '@fulbito/types'

export function shapeStoreMatches(
  matches: Array<{
    id: string
    date: Date
    type: string
    name: string | null
    teamAScore: number
    teamBScore: number
    shirtsResponsibleId?: string | null
    players: Array<{ playerId: string; team: 'A' | 'B'; goals: number; performance: number }>
  }>,
  nameMap: Map<string, string>
): StoreMatch[] {
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

