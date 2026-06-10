import type { Match } from '@fulbito/types'

export function onlyFinalMatches<T extends Pick<Match, 'status'>>(matches: T[]): T[] {
  return matches.filter((m) => m.status !== 'draft')
}
