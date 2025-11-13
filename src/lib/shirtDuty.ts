import type { Player } from '@/store/usePlayerStore'
import type { Match as StoreMatch } from '@/store/useMatchStore'

export function buildPlayedBeforeSet(matches: StoreMatch[]): Set<string> {
  const played = new Set<string>()
  for (const m of matches) {
    for (const p of m.teamA) played.add(p.id)
    for (const p of m.teamB) played.add(p.id)
  }
  return played
}

export function getEligiblePlayerIds(teamPlayerIds: string[], playedBefore: Set<string>): string[] {
  const eligible = teamPlayerIds.filter(id => playedBefore.has(id))
  return eligible.length > 0 ? eligible : teamPlayerIds
}

export function computeLeastAssignedPoolIds(consideredIds: string[], allPlayers: Player[]): { poolIds: string[], min: number } {
  const counts = new Map<string, number>(allPlayers.map(p => [p.id, p.shirtDutiesCount ?? 0]))
  let min = Infinity
  for (const id of consideredIds) {
    const c = counts.get(id) ?? 0
    if (c < min) min = c
  }
  const poolIds = consideredIds.filter(id => (counts.get(id) ?? 0) === min)
  return { poolIds, min }
}


