import type { Match, Player } from '@fulbito/types'
import { getMvpCountsByPlayerId } from './mvp'
import { getShirtDutiesByPlayerId } from './shirtDuty'
import { calculateAllCurrentStreaks, calculateAllLongestLossStreaks, eventYear, findAllStreakEvents } from './playerStats'

export const CHAMPIONSHIP_THRESHOLD = 7

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
  lossStreak: number
  lostFinals: number
}

export function computePlayerStatRows(players: Player[], matches: Match[]): PlayerStatRow[] {
  const map: Record<string, PlayerStatRow> = {}
  const shirtCountById = getShirtDutiesByPlayerId(matches)
  const mvpCountById = getMvpCountsByPlayerId(matches)
  const lossStreakById = calculateAllLongestLossStreaks(matches)
  const streakEventsById = findAllStreakEvents(matches, CHAMPIONSHIP_THRESHOLD)
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
            lossStreak: lossStreakById[p.id] ?? 0,
            lostFinals: (streakEventsById[p.id] ?? []).filter((e) => e.kind === 'lostFinal').length,
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
export type AwardKey = 'matches' | 'goals' | 'lossStreak' | 'lostFinals' | 'shirts' | 'mvps'

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
    title: 'El jugador más constante',
    subtitle:
      'Este premio es otorgado al jugador con mejor asistencia de la temporada, el que siempre está anotado en la lista.',
    unitLabel: 'PARTIDOS',
    accent: 'brand',
    getValue: (row) => row.matches,
  },
  {
    key: 'goals',
    title: 'Máximo Goleador',
    subtitle: 'El francotirador del torneo, el mayor artillero de la temporada',
    unitLabel: 'GOLES',
    accent: 'secondary',
    getValue: (row) => row.goals,
  },
  {
    key: 'lossStreak',
    title: 'La piedra del equipo',
    subtitle: 'Peor racha de derrotas seguidas, el que nadie quiere tener en su equipo',
    unitLabel: 'DERROTAS SEGUIDAS',
    accent: 'muted',
    getValue: (row) => row.lossStreak,
  },
  {
    key: 'lostFinals',
    title: 'El eterno subcampeón',
    subtitle: `Llegó a ${CHAMPIONSHIP_THRESHOLD - 1} victorias seguidas y perdió la final. Tan cerca de la gloria, tan lejos.`,
    unitLabel: 'FINALES PERDIDAS',
    accent: 'secondary',
    getValue: (row) => row.lostFinals,
  },
  {
    key: 'shirts',
    title: 'El lavarropas del año',
    subtitle: 'El terror del lavadero, el que más veces se llevó las casacas a lavar',
    unitLabel: 'LAVADAS',
    accent: 'muted',
    getValue: (row) => row.shirts,
  },
  {
    key: 'mvps',
    title: 'Máximo MVP',
    subtitle: 'La estrella indiscutida de la cancha esta temporada',
    unitLabel: 'MVPS',
    accent: 'brand',
    getValue: (row) => row.mvps,
  },
]

export type AwardEntry = { row: PlayerStatRow; value: number }
export type AwardPodium = { def: AwardDef; winner: AwardEntry; runnersUp: AwardEntry[] }

const PODIUM_SIZE = 3

export function pickAwardPodiums(rows: PlayerStatRow[]): AwardPodium[] {
  return AWARD_DEFS.map((def) => {
    const ranked = rows
      .map((row) => ({ row, value: def.getValue(row) }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value || a.row.name.localeCompare(b.row.name))
      .slice(0, PODIUM_SIZE)

    const [winner, ...runnersUp] = ranked
    return winner ? { def, winner, runnersUp } : null
  }).filter((p): p is AwardPodium => p !== null)
}

export type SeasonChampion = {
  playerId: string
  playerName: string
  playerPhotoUrl?: string | null
  streak: number
}

export function pickSeasonChampions(players: Player[], allMatches: Match[], year: number): SeasonChampion[] {
  const eventsById = findAllStreakEvents(allMatches, CHAMPIONSHIP_THRESHOLD)

  return players
    .filter((p) => (eventsById[p.id] ?? []).some((e) => e.kind === 'title' && eventYear(e) === year))
    .map((p) => ({
      playerId: p.id,
      playerName: p.name,
      playerPhotoUrl: p.photoUrl,
      streak: CHAMPIONSHIP_THRESHOLD,
    }))
    .sort((a, b) => a.playerName.localeCompare(b.playerName))
}

export function computeSeasonStatRows(players: Player[], allMatches: Match[], year: number): PlayerStatRow[] {
  const seasonMatches = allMatches.filter((m) => new Date(m.date).getFullYear() === year)
  const eventsById = findAllStreakEvents(allMatches, CHAMPIONSHIP_THRESHOLD)

  return computePlayerStatRows(players, seasonMatches).map((row) => ({
    ...row,
    lostFinals: (eventsById[row.id] ?? []).filter((e) => e.kind === 'lostFinal' && eventYear(e) === year).length,
  }))
}

export type ChampionshipProgress = {
  playerId: string
  playerName: string
  playerPhotoUrl?: string | null
  streak: number
  isChampion: boolean
} | null

export function pickChampionshipProgress(players: Player[], matches: Match[]): ChampionshipProgress {
  const streaks = calculateAllCurrentStreaks(matches)
  let best: { player: Player; streak: number } | null = null

  for (const p of players) {
    const s = streaks[p.id]
    if (s?.kind !== 'win' || s.count <= 0) continue
    if (!best || s.count > best.streak || (s.count === best.streak && p.name.localeCompare(best.player.name) < 0)) {
      best = { player: p, streak: s.count }
    }
  }

  if (!best) return null
  return {
    playerId: best.player.id,
    playerName: best.player.name,
    playerPhotoUrl: best.player.photoUrl,
    streak: best.streak,
    isChampion: best.streak >= CHAMPIONSHIP_THRESHOLD,
  }
}

export type HallOfFameEntry = { year: number; champions: SeasonChampion[] }

export function pickHallOfFame(players: Player[], allMatches: Match[], years: number[]): HallOfFameEntry[] {
  return years
    .map((year) => ({ year, champions: pickSeasonChampions(players, allMatches, year) }))
    .filter((entry) => entry.champions.length > 0)
}

export function listAvailableSeasons(matches: Match[]): number[] {
  const years = new Set(matches.map((m) => new Date(m.date).getFullYear()))
  years.add(new Date().getFullYear())
  return Array.from(years).sort((a, b) => b - a)
}
