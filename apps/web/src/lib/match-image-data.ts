import type { Match, MatchPlayer, Player } from '@fulbito/types'
import {
  formatMatchHour,
  oneDecimal,
  parseMatchDate,
  teamTotals,
  winProbabilityA,
  type TeamTotals,
} from '@fulbito/utils'
import type { MatchImageData, MatchImageTeam } from './match-image'

const longMonthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', timeZone: 'UTC' })
const weekdayFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'long', timeZone: 'UTC' })

function imageTeam(
  title: string,
  players: MatchPlayer[],
  totals: TeamTotals,
  winProbability: number,
  goalkeeperIds: Set<string>,
): MatchImageTeam {
  return {
    title,
    players: players.map((player) => ({ name: player.name, isGoalkeeper: goalkeeperIds.has(player.id) })),
    skill: oneDecimal(totals.skill),
    physical: oneDecimal(totals.physical),
    winProbability,
  }
}

export function buildMatchImageData(
  match: Match,
  playerById: Map<string, Player>,
  tournamentPhotoUrl: string | null,
): MatchImageData {
  const { date, hour } = parseMatchDate(match)
  const matchDay = new Date(`${date}T00:00:00Z`)
  const weekday = weekdayFormatter.format(matchDay)
  const playersCount = match.teamA.length + match.teamB.length
  const goalkeeperIds = new Set(match.goalkeeperIds ?? [])
  const totalsA = teamTotals(match.teamA, playerById)
  const totalsB = teamTotals(match.teamB, playerById)
  const probabilityA = winProbabilityA(totalsA, totalsB)
  const shirtsName = match.shirtsResponsibleId ? playerById.get(match.shirtsResponsibleId)?.name : undefined
  return {
    tournamentPhotoUrl,
    name: match.name || 'Partido',
    dateLabel: `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${matchDay.getUTCDate()} de ${longMonthFormatter.format(matchDay)}`,
    hourLabel: hour !== null ? formatMatchHour(hour) : null,
    location: match.location?.name ?? null,
    address: match.location?.street ?? null,
    typeLabel: `${match.type} · ${playersCount} ${playersCount === 1 ? 'confirmado' : 'confirmados'}`,
    shirtsName: shirtsName ?? null,
    teamA: imageTeam('Team A', match.teamA, totalsA, probabilityA, goalkeeperIds),
    teamB: imageTeam('Team B', match.teamB, totalsB, 100 - probabilityA, goalkeeperIds),
  }
}
