import type { Match } from '@fulbito/types'

export function getShirtDutiesByPlayerId(matches: Match[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const m of matches) {
    if (m.shirtsResponsibleId) {
      counts.set(m.shirtsResponsibleId, (counts.get(m.shirtsResponsibleId) ?? 0) + 1)
    }
  }
  return counts
}

export function buildPlayedBeforeSet(matches: Match[]): Set<string> {
  const played = new Set<string>()
  for (const m of matches) {
    for (const p of m.teamA) played.add(p.id)
    for (const p of m.teamB) played.add(p.id)
  }
  return played
}

export function getEligiblePlayerIds(
  teamPlayerIds: string[],
  playedBefore: Set<string>
): string[] {
  const eligible = teamPlayerIds.filter(id => playedBefore.has(id))
  return eligible.length > 0 ? eligible : teamPlayerIds
}

export function computeLeastAssignedPoolIds(
  consideredIds: string[],
  dutiesById: Map<string, number>,
): { poolIds: string[]; min: number } {
  let min = Infinity
  for (const id of consideredIds) {
    const c = dutiesById.get(id) ?? 0
    if (c < min) min = c
  }
  const poolIds = consideredIds.filter(id => (dutiesById.get(id) ?? 0) === min)
  return { poolIds, min }
}
