import type { Match, MyMatchEntry } from '@fulbito/types'

export type EntryResult = 'win' | 'loss' | 'draw'

export function getEntryPlayer(entry: MyMatchEntry) {
  return entry.match.teamA.concat(entry.match.teamB).find((player) => player.id === entry.playerId)
}

export function getEntryResult({ match, playerId }: MyMatchEntry): EntryResult {
  const inA = match.teamA.some((player) => player.id === playerId)
  const own = inA ? match.teamAScore : match.teamBScore
  const rival = inA ? match.teamBScore : match.teamAScore
  if (own === rival) return 'draw'
  return own > rival ? 'win' : 'loss'
}

export function compareEntriesChronological(a: MyMatchEntry, b: MyMatchEntry): number {
  return a.match.date.localeCompare(b.match.date) || a.match.createdAt.localeCompare(b.match.createdAt)
}

export function isOfficialEntry(entry: MyMatchEntry): boolean {
  return entry.match.status !== 'draft' && !entry.match.isFriendly && getEntryPlayer(entry) !== undefined
}

export function getOpponentLabel(match: Pick<Match, 'opponentName' | 'teamB'>): string | null {
  return match.teamB.length === 0 ? (match.opponentName ?? null) : null
}
