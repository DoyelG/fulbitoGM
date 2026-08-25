import type { Match, Player } from '@fulbito/types'
import { getMvpCountsByPlayerId, getShirtDutiesByPlayerId } from '@fulbito/utils'
import { useMemo } from 'react'

export type PlayerStatRow = {
  id: string
  name: string
  photoUrl?: string
  matches: number
  goals: number
  totalPerformance: number
  wins: number
  losses: number
  draws: number
  shirts: number
  mvps: number
}

export function usePlayerStatRows(players: Player[], matches: Match[]): PlayerStatRow[] {
  return useMemo(() => {
    const map: Record<string, PlayerStatRow> = {}
    const shirtCountById = getShirtDutiesByPlayerId(matches)
    const mvpCountById = getMvpCountsByPlayerId(matches)
    const photoById = new Map(players.map((p) => [p.id, p.photoUrl ?? undefined]))

    for (const m of matches) {
      const process =
        (team: 'A' | 'B') =>
        (p: {
          id: string
          name: string
          goals: number
          performance: number
        }) => {
          if (!map[p.id]) {
            map[p.id] = {
              id: p.id,
              name: p.name,
              photoUrl: photoById.get(p.id),
              matches: 0,
              goals: 0,
              totalPerformance: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              shirts: shirtCountById.get(p.id) ?? 0,
              mvps: mvpCountById.get(p.id) ?? 0,
            }
          }

          map[p.id].matches++
          map[p.id].goals += p.goals
          map[p.id].totalPerformance += p.performance

          const a = m.teamAScore
          const b = m.teamBScore
          if (team === 'A') {
            if (a > b) map[p.id].wins++
            else if (a < b) map[p.id].losses++
            else map[p.id].draws++
          } else {
            if (b > a) map[p.id].wins++
            else if (b < a) map[p.id].losses++
            else map[p.id].draws++
          }
        }

      m.teamA.forEach(process('A'))
      m.teamB.forEach(process('B'))
    }

    for (const row of Object.values(map)) {
      row.totalPerformance = row.matches > 0 ? row.totalPerformance / row.matches : 0
    }

    return Object.values(map)
  }, [players, matches])
}
