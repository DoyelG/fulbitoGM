import type { MatchPlayer, Player, Skills } from '@fulbito/types'

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

export type SkillKey = keyof Skills

export const SKILL_KEYS: readonly SkillKey[] = ['physical', 'technical', 'tactical', 'psychological']

export type TeamSkillAverages = Record<SkillKey, number | null>

export function teamSkillAverages(players: MatchPlayer[], playerById: Map<string, Player>): TeamSkillAverages {
  const averageOf = (key: SkillKey): number | null => {
    const values = players.flatMap((player) => {
      const value = playerById.get(player.id)?.skills?.[key]
      return typeof value === 'number' ? [value] : []
    })
    return values.length > 0 ? oneDecimal(values.reduce((sum, value) => sum + value, 0) / values.length) : null
  }
  return {
    physical: averageOf('physical'),
    technical: averageOf('technical'),
    tactical: averageOf('tactical'),
    psychological: averageOf('psychological'),
  }
}
