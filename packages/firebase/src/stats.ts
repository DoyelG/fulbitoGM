import type { Match, Player } from '@fulbito/types'

export type PlayerStats = {
  playerId: string
  name: string
  matches: number
  goals: number
  avgPerformance: number
  wins: number
  losses: number
  draws: number
}

export function computePlayerStats(players: Player[], matches: Match[]): PlayerStats[] {
  const statsMap = new Map<string, PlayerStats>()

  for (const player of players) {
    statsMap.set(player.id, {
      playerId: player.id,
      name: player.name,
      matches: 0,
      goals: 0,
      avgPerformance: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    })
  }

  for (const match of matches) {
    const aWon = match.teamAScore > match.teamBScore
    const bWon = match.teamBScore > match.teamAScore
    const draw = match.teamAScore === match.teamBScore

    for (const mp of match.teamA) {
      const s = statsMap.get(mp.id)
      if (!s) continue
      s.matches++
      s.goals += mp.goals
      s.avgPerformance += mp.performance
      if (aWon) s.wins++
      else if (bWon) s.losses++
      else s.draws++
    }

    for (const mp of match.teamB) {
      const s = statsMap.get(mp.id)
      if (!s) continue
      s.matches++
      s.goals += mp.goals
      s.avgPerformance += mp.performance
      if (bWon) s.wins++
      else if (aWon) s.losses++
      else s.draws++
    }
  }

  for (const s of statsMap.values()) {
    if (s.matches > 0) s.avgPerformance = s.avgPerformance / s.matches
  }

  return Array.from(statsMap.values()).sort((a, b) => b.matches - a.matches)
}
