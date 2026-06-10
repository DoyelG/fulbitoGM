import type { Match } from '@fulbito/types'

export function getMvpCountsByPlayerId(matches: Match[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const m of matches) {
    if (m.mvpId) {
      counts.set(m.mvpId, (counts.get(m.mvpId) ?? 0) + 1)
    }
  }
  return counts
}
