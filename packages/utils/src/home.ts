import type { Match, MatchPlayer, Player } from '@fulbito/types'
import type { PlayerStatRow } from './awards'
import { onlyFinalMatches } from './match'
import { calculateAllCurrentStreaks } from './playerStats'

export const MIN_HOME_STREAK = 2

export type StreakLeader = {
  playerId: string
  playerName: string
  playerPhotoUrl?: string
  count: number
}

export type StreakLeaders = { winning: StreakLeader[]; losing: StreakLeader[] }

export function parseMatchDate(date: string): Date {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatMatchDate(date: string, locale = 'es-AR'): string {
  return parseMatchDate(date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
}

export function pickLatestFinalMatch(matches: Match[]): Match | null {
  let latest: Match | null = null
  for (const m of onlyFinalMatches(matches)) {
    if (!latest || m.date > latest.date || (m.date === latest.date && m.createdAt > latest.createdAt)) {
      latest = m
    }
  }
  return latest
}

export function getTeamScorers(team: MatchPlayer[]): MatchPlayer[] {
  return team
    .filter((p) => p.goals > 0 && p.name.trim() !== '')
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
}

export function getMatchMvpName(match: Pick<Match, 'teamA' | 'teamB' | 'mvpId'>): string | null {
  if (!match.mvpId) return null
  return [...match.teamA, ...match.teamB].find((p) => p.id === match.mvpId)?.name.trim() || null
}

export function summarizeTeam(team: MatchPlayer[], visible = 3): string {
  const named = team.filter((p) => p.name.trim() !== '')
  const names = named.slice(0, visible).map((p) => p.name.trim().split(/\s+/)[0])
  const rest = named.length - names.length
  return rest > 0 ? `${names.join(', ')} +${rest}` : names.join(', ')
}

function byCountThenName(a: StreakLeader, b: StreakLeader): number {
  return b.count - a.count || a.playerName.localeCompare(b.playerName)
}

export function pickStreakLeaders(
  players: Player[],
  matches: Match[],
  opts: { winLimit: number; lossLimit: number },
): StreakLeaders {
  const streaks = calculateAllCurrentStreaks(onlyFinalMatches(matches))
  const winning: StreakLeader[] = []
  const losing: StreakLeader[] = []

  for (const p of players) {
    const s = streaks[p.id]
    if (!s || s.count < MIN_HOME_STREAK) continue
    const leader: StreakLeader = { playerId: p.id, playerName: p.name, playerPhotoUrl: p.photoUrl, count: s.count }
    if (s.kind === 'win') winning.push(leader)
    else if (s.kind === 'loss') losing.push(leader)
  }

  return {
    winning: winning.sort(byCountThenName).slice(0, opts.winLimit),
    losing: losing.sort(byCountThenName).slice(0, opts.lossLimit),
  }
}

export type RankedStat = {
  playerId: string
  playerName: string
  playerPhotoUrl?: string
  value: number
  rank: number
}

export function rankStatRows(rows: PlayerStatRow[], stat: 'goals' | 'mvps', limit: number): RankedStat[] {
  const sorted = rows
    .filter((r) => r[stat] > 0 && r.name.trim() !== '')
    .sort((a, b) => b[stat] - a[stat] || a.name.localeCompare(b.name))
  return sorted.slice(0, limit).map((r) => ({
    playerId: r.id,
    playerName: r.name,
    playerPhotoUrl: r.photoUrl,
    value: r[stat],
    rank: 1 + sorted.filter((o) => o[stat] > r[stat]).length,
  }))
}
