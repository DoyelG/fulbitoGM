import type { MembershipRef, MyMatchEntry, MyTournament } from '@fulbito/types'
import {
  computePersonalSummary,
  filterEntriesByYear,
  getEntryYears,
  sortEntriesNewestFirst,
  type PersonalSummary,
} from './player-summary'
import { isPersonalTournament } from './tournament-member'
import { calculateUnbeatenRun, type UnbeatenRun } from './world-cup'

export type PersonalHistory = {
  run: UnbeatenRun
  years: number[]
  summary: PersonalSummary
  sortedEntries: MyMatchEntry[]
}

export type PersonalCardStats = Pick<PersonalHistory, 'run' | 'summary'>

export function buildPersonalHistory(entries: MyMatchEntry[], year: number | 'all'): PersonalHistory {
  const filtered = filterEntriesByYear(entries, year)
  return {
    run: calculateUnbeatenRun(entries),
    years: getEntryYears(entries),
    summary: computePersonalSummary(filtered),
    sortedEntries: sortEntriesNewestFirst(filtered),
  }
}

export function toMembershipRefs(myTournaments: MyTournament[]): MembershipRef[] {
  return myTournaments.map(({ tournament, membership }) => ({
    tournamentId: tournament.id,
    playerId: membership.playerId ?? null,
  }))
}

export function findPersonalTournament(myTournaments: MyTournament[]): MyTournament | null {
  return myTournaments.find(({ tournament }) => isPersonalTournament(tournament)) ?? null
}

const PERSONAL_BLOCKED_PREFIXES = ['/players', '/statistics', '/awards', '/requests', '/messages']

export function isPersonalBlockedPath(pathname: string): boolean {
  return (
    pathname === '/history' ||
    PERSONAL_BLOCKED_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    /^\/tournaments\/[^/]+\/members/.test(pathname)
  )
}
