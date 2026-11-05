export type MatchImagePlayer = { name: string; isGoalkeeper: boolean }

export type MatchImageTeam = {
  title: string
  players: MatchImagePlayer[]
  skill: number
  physical: number
  winProbability: number
}

export type MatchImageData = {
  tournamentPhotoUrl: string | null
  name: string
  dateLabel: string
  hourLabel: string | null
  location: string | null
  address: string | null
  typeLabel: string
  shirtsName: string | null
  teamA: MatchImageTeam
  teamB: MatchImageTeam
}

const MAX_TEXT_LENGTH = 80
const MAX_PLAYERS_PER_TEAM = 15

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, MAX_TEXT_LENGTH) : null
}

function finiteNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value * 10) / 10 : 0
}

function parseTeam(value: unknown): MatchImageTeam | null {
  if (typeof value !== 'object' || value === null) return null
  const team = value as Record<string, unknown>
  const players = Array.isArray(team.players) ? team.players.slice(0, MAX_PLAYERS_PER_TEAM) : []
  return {
    title: text(team.title) ?? '',
    players: players.flatMap((player: unknown) => {
      if (typeof player !== 'object' || player === null) return []
      const name = text((player as Record<string, unknown>).name)
      return name ? [{ name, isGoalkeeper: (player as Record<string, unknown>).isGoalkeeper === true }] : []
    }),
    skill: finiteNumber(team.skill),
    physical: finiteNumber(team.physical),
    winProbability: Math.min(100, Math.max(0, Math.round(finiteNumber(team.winProbability)))),
  }
}

export function parseMatchImageData(value: unknown): MatchImageData | null {
  if (typeof value !== 'object' || value === null) return null
  const data = value as Record<string, unknown>
  const teamA = parseTeam(data.teamA)
  const teamB = parseTeam(data.teamB)
  const dateLabel = text(data.dateLabel)
  if (!teamA || !teamB || !dateLabel) return null
  return {
    tournamentPhotoUrl: typeof data.tournamentPhotoUrl === 'string' ? data.tournamentPhotoUrl : null,
    name: text(data.name) ?? 'Partido',
    dateLabel,
    hourLabel: text(data.hourLabel),
    location: text(data.location),
    address: text(data.address),
    typeLabel: text(data.typeLabel) ?? '',
    shirtsName: text(data.shirtsName),
    teamA,
    teamB,
  }
}
