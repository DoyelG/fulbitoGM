import { getMatchYears } from './match'
import type { Match, MyMatchEntry } from '@fulbito/types'
import { compareEntriesChronological, getEntryPlayer, getEntryResult, isOfficialEntry } from './match-entry'

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

export type PersonalSummary = PlayerMatchSummary & {
  goalsPerMatch: number
  avgPerformance: number
  streak: { kind: 'win' | 'loss' | null; count: number }
}

function currentStreak(entries: MyMatchEntry[]): PersonalSummary['streak'] {
  const newestFirst = entries.filter(isOfficialEntry).sort((a, b) => compareEntriesChronological(b, a))
  let kind: 'win' | 'loss' | null = null
  let count = 0
  for (const entry of newestFirst) {
    const result = getEntryResult(entry)
    if (result === 'draw') continue
    if (!kind) {
      kind = result
      count = 1
    } else if (result === kind) {
      count++
    } else {
      break
    }
  }
  return { kind, count }
}

export function computePersonalSummary(entries: MyMatchEntry[]): PersonalSummary {
  const total: PlayerMatchSummary = { matches: 0, goals: 0, wins: 0, draws: 0, losses: 0, winRate: 0 }
  let totalPerformance = 0
  for (const entry of entries) {
    const played = getEntryPlayer(entry)
    if (!played || !isOfficialEntry(entry)) continue
    const result = getEntryResult(entry)
    total.matches++
    total.goals += played.goals
    totalPerformance += played.performance
    if (result === 'win') total.wins++
    else if (result === 'loss') total.losses++
    else total.draws++
  }
  total.winRate = total.matches ? Math.round((total.wins / total.matches) * 100) : 0
  return {
    ...total,
    goalsPerMatch: total.matches ? Math.round((total.goals / total.matches) * 10) / 10 : 0,
    avgPerformance: total.matches ? Math.round((totalPerformance / total.matches) * 10) / 10 : 0,
    streak: currentStreak(entries),
  }
}

export function getEntryYears(entries: MyMatchEntry[], currentYear = new Date().getFullYear()): number[] {
  const years = new Set([...getMatchYears(entries.map(({ match }) => match)), currentYear])
  return [...years].sort((yearA, yearB) => yearB - yearA)
}

export function filterEntriesByYear(entries: MyMatchEntry[], year: number | 'all'): MyMatchEntry[] {
  if (year === 'all') return entries
  return entries.filter(({ match }) => Number(match.date.slice(0, 4)) === year)
}

export function sortEntriesNewestFirst(entries: MyMatchEntry[]): MyMatchEntry[] {
  return entries.slice().sort((a, b) => compareEntriesChronological(b, a))
}
