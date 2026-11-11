import type { Match, MatchType } from '@fulbito/types'

export { MATCH_TYPES } from '@fulbito/types'

export const MAX_GOALKEEPERS = 2

export function onlyFinalMatches<T extends Pick<Match, 'status'>>(matches: T[]): T[] {
  return matches.filter((m) => m.status !== 'draft')
}

export type MatchKindFilter = 'all' | 'competitive' | 'friendly'

export type MatchFilters = {
  types: MatchType[]
  kind: MatchKindFilter
  year: number | 'all'
}

export const DEFAULT_MATCH_FILTERS: MatchFilters = { types: [], kind: 'all', year: 'all' }

function matchYear(match: Pick<Match, 'date'>): number {
  return Number(match.date.slice(0, 4))
}

export function filterMatches<T extends Pick<Match, 'type' | 'isFriendly' | 'date'>>(
  matches: T[],
  filters: MatchFilters,
): T[] {
  return matches.filter((match) => {
    if (filters.types.length > 0 && !filters.types.includes(match.type as MatchType)) return false
    if (filters.kind === 'friendly' && !match.isFriendly) return false
    if (filters.kind === 'competitive' && match.isFriendly) return false
    if (filters.year !== 'all' && matchYear(match) !== filters.year) return false
    return true
  })
}

export function getMatchYears(matches: Pick<Match, 'date'>[]): number[] {
  return [...new Set(matches.map(matchYear))].sort((yearA, yearB) => yearB - yearA)
}

export const MATCH_HOUR_OPTIONS: number[] = Array.from({ length: 24 }, (_, i) => i)

export type MatchDateParts = { date: string; hour: number | null }

export function buildMatchSchedule(date: string, hour: number | null): Pick<Match, 'date' | 'hasTime'> {
  if (hour === null) {
    return { date: `${date}T00:00:00.000Z`, hasTime: false }
  }
  const [year, month, day] = date.split('-').map(Number)
  return { date: new Date(Date.UTC(year, month - 1, day, hour)).toISOString(), hasTime: true }
}

export function parseMatchDate(match: Pick<Match, 'date' | 'hasTime'>): MatchDateParts {
  const raw = Number.parseInt(match.date.slice(11, 13), 10)
  const hour = match.hasTime && !Number.isNaN(raw) ? raw : null
  return { date: match.date.slice(0, 10), hour }
}

export function formatMatchHour(hour: number): string {
  return `${hour}hs`
}

export function formatMatchClock(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

export function formatMatchDate(day: string): string {
  const [year, month, date] = day.split('-')
  if (!year || !month || !date) return ''
  return `${date}/${month}/${year}`
}

export function formatShortMatchDate(day: string): string {
  const [, month, date] = day.split('-')
  if (!month || !date) return ''
  return `${date}/${month}`
}

export function toLocalDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function pickRecentMatches<T extends Pick<Match, 'date' | 'status'>>(matches: T[], limit: number): T[] {
  return [...onlyFinalMatches(matches)].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
}
