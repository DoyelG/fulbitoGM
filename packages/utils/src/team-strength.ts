import type { MatchPlayer, Player } from '@fulbito/types'

export type TeamTotals = { skill: number; physical: number }

const UNKNOWN_SKILL = 5

export function oneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

export function teamTotals(players: MatchPlayer[], playerById: Map<string, Player>): TeamTotals {
  return players.reduce(
    (totals, player) => {
      const info = playerById.get(player.id)
      const physical = info?.skills?.physical
      return {
        skill: totals.skill + (info?.skill ?? UNKNOWN_SKILL),
        physical: totals.physical + (typeof physical === 'number' ? physical : UNKNOWN_SKILL),
      }
    },
    { skill: 0, physical: 0 },
  )
}

export function winProbabilityA(totalsA: TeamTotals, totalsB: TeamTotals): number {
  const combinedSkill = totalsA.skill + totalsB.skill
  return combinedSkill > 0 ? Math.round((totalsA.skill / combinedSkill) * 100) : 50
}
