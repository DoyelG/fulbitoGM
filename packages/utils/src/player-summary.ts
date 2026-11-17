import type { Match } from '@fulbito/types'

export type PlayerMatchSummary = {
  matches: number
  goals: number
  wins: number
  draws: number
  losses: number
  winRate: number
}

export function getPlayerMatchSummary(matches: Match[], playerId: string): PlayerMatchSummary {
  const summary: PlayerMatchSummary = { matches: 0, goals: 0, wins: 0, draws: 0, losses: 0, winRate: 0 }
  for (const match of matches) {
    if (match.status === 'draft') continue
    const inA = match.teamA.find((player) => player.id === playerId)
    const inB = inA ? undefined : match.teamB.find((player) => player.id === playerId)
    const played = inA ?? inB
    if (!played) continue
    summary.matches++
    summary.goals += played.goals
    const ownScore = inA ? match.teamAScore : match.teamBScore
    const rivalScore = inA ? match.teamBScore : match.teamAScore
    if (ownScore > rivalScore) summary.wins++
    else if (ownScore < rivalScore) summary.losses++
    else summary.draws++
  }
  summary.winRate = summary.matches ? Math.round((summary.wins / summary.matches) * 100) : 0
  return summary
}
