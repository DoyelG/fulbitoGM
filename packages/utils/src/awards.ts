import type { Match, Player } from '@fulbito/types'
import { getMvpCountsByPlayerId } from './mvp'
import { getShirtDutiesByPlayerId } from './shirtDuty'
import { calculateAllLongestWinStreaks } from './playerStats'

export type PlayerStatRow = {
  id: string
  name: string
  photoUrl?: string
  matches: number
  goals: number
  totalPerformance: number
  wins: number
  losses: number
  draws: number
  shirts: number
  mvps: number
  streak: number
}

export function computePlayerStatRows(players: Player[], matches: Match[]): PlayerStatRow[] {
  const map: Record<string, PlayerStatRow> = {}
  const shirtCountById = getShirtDutiesByPlayerId(matches)
  const mvpCountById = getMvpCountsByPlayerId(matches)
  const streakById = calculateAllLongestWinStreaks(matches)
  const photoById = new Map(players.map((p) => [p.id, p.photoUrl ?? undefined]))

  for (const m of matches) {
    const process =
      (team: 'A' | 'B') =>
      (p: { id: string; name: string; goals: number; performance: number }) => {
        if (!map[p.id]) {
          map[p.id] = {
            id: p.id,
            name: p.name,
            photoUrl: photoById.get(p.id),
            matches: 0,
            goals: 0,
            totalPerformance: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            shirts: shirtCountById.get(p.id) ?? 0,
            mvps: mvpCountById.get(p.id) ?? 0,
            streak: streakById[p.id] ?? 0,
          }
        }

        map[p.id].matches++
        map[p.id].goals += p.goals
        map[p.id].totalPerformance += p.performance

        const a = m.teamAScore
        const b = m.teamBScore
        if (team === 'A') {
          if (a > b) map[p.id].wins++
          else if (a < b) map[p.id].losses++
          else map[p.id].draws++
        } else {
          if (b > a) map[p.id].wins++
          else if (b < a) map[p.id].losses++
          else map[p.id].draws++
        }
      }

    m.teamA.forEach(process('A'))
    m.teamB.forEach(process('B'))
  }

  for (const row of Object.values(map)) {
    row.totalPerformance = row.matches > 0 ? row.totalPerformance / row.matches : 0
  }

  return Object.values(map)
}

export type AwardAccent = 'brand' | 'secondary' | 'muted'
export type AwardKey = 'matches' | 'wins' | 'losses' | 'shirts' | 'mvps' | 'streak'

export type AwardDef = {
  key: AwardKey
  title: string
  subtitle: string
  unitLabel: string
  accent: AwardAccent
  getValue: (row: PlayerStatRow) => number
}

export const AWARD_DEFS: AwardDef[] = [
  {
    key: 'matches',
    title: 'Most Matches Played',
    subtitle: 'The Iron Man',
    unitLabel: 'MATCHES',
    accent: 'brand',
    getValue: (row) => row.matches,
  },
  {
    key: 'wins',
    title: 'Most Wins',
    subtitle: 'The Ultimate Winner',
    unitLabel: 'WINS',
    accent: 'brand',
    getValue: (row) => row.wins,
  },
  {
    key: 'losses',
    title: 'Fighting Spirit',
    subtitle: 'Most Losses (We still love you)',
    unitLabel: 'LOSSES',
    accent: 'muted',
    getValue: (row) => row.losses,
  },
  {
    key: 'shirts',
    title: 'Kit Washer of the Year',
    subtitle: 'Unsung Hero',
    unitLabel: 'WASHES',
    accent: 'secondary',
    getValue: (row) => row.shirts,
  },
  {
    key: 'mvps',
    title: 'Most MVPs',
    subtitle: 'The undeniable star of the pitch this season.',
    unitLabel: 'MVPS',
    accent: 'brand',
    getValue: (row) => row.mvps,
  },
  {
    key: 'streak',
    title: 'Racha Ganadora',
    subtitle: 'On Fire',
    unitLabel: 'VICTORIAS SEGUIDAS',
    accent: 'secondary',
    getValue: (row) => row.streak,
  },
]

export type AwardWinner = { def: AwardDef; row: PlayerStatRow; value: number }

function pickWinner(stats: PlayerStatRow[], def: AwardDef): AwardWinner | null {
  let top: PlayerStatRow | undefined
  for (const row of stats) {
    if (!top) {
      top = row
      continue
    }
    const diff = def.getValue(row) - def.getValue(top)
    if (diff > 0 || (diff === 0 && row.name.localeCompare(top.name) < 0)) {
      top = row
    }
  }
  if (!top) return null

  const value = def.getValue(top)
  if (value <= 0) return null

  return { def, row: top, value }
}

export function pickAwardWinners(rows: PlayerStatRow[]): AwardWinner[] {
  return AWARD_DEFS.map((def) => pickWinner(rows, def)).filter((w): w is AwardWinner => w !== null)
}
