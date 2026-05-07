import type { Match, Player } from '@fulbito/types'

import type { MatchType, RecordingPlayer } from './types'

export function formatDate(iso: string): string {
  if (!iso) return ''
  const [yy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yy}`
}

export function toPlayerInfo(p: Player) {
  return {
    id: p.id,
    name: p.name,
    position: p.position,
    skill: (p.skill ?? 'unknown') as number | 'unknown',
    physical: (p.skills?.physical ?? 'unknown') as number | 'unknown',
  }
}

export type TeamStats = {
  skillA: number
  skillB: number
  physA: number
  physB: number
  winPctA: number
  winPctB: number
}

export function computeTeamStats(
  teamA: RecordingPlayer[],
  teamB: RecordingPlayer[],
  poolPlayers: Player[],
): TeamStats {
  const norm = (v: number | null | undefined) => (v == null ? 5 : v)
  const normPhys = (v: number | 'unknown' | null | undefined) =>
    v === 'unknown' || v == null ? 5 : v

  const teamAIds = new Set(teamA.map((p) => p.id))
  const teamBIds = new Set(teamB.map((p) => p.id))
  const playersA = poolPlayers.filter((p) => teamAIds.has(p.id))
  const playersB = poolPlayers.filter((p) => teamBIds.has(p.id))

  const skillA = playersA.reduce((s, p) => s + norm(p.skill), 0)
  const skillB = playersB.reduce((s, p) => s + norm(p.skill), 0)
  const physA = playersA.reduce((s, p) => s + normPhys(p.skills?.physical), 0)
  const physB = playersB.reduce((s, p) => s + normPhys(p.skills?.physical), 0)

  const total = skillA + skillB
  const winPctA = total > 0 ? Math.round((skillA / total) * 100) : 50
  const winPctB = total > 0 ? 100 - winPctA : 50

  return { skillA, skillB, physA, physB, winPctA, winPctB }
}

export type BuildPayloadInput = {
  matchDate: string
  matchType: MatchType
  matchName: string
  teamA: RecordingPlayer[]
  teamB: RecordingPlayer[]
  teamAScore: number
  teamBScore: number
  goalsA: Record<string, string>
  goalsB: Record<string, string>
  perfA: Record<string, string>
  perfB: Record<string, string>
  shirtsResponsibleId: string | null
}

export function buildMatchPayload(input: BuildPayloadInput): Omit<Match, 'id'> {
  const buildTeamPlayers = (
    team: RecordingPlayer[],
    goals: Record<string, string>,
    perf: Record<string, string>,
  ) =>
    team.map((p) => ({
      id: p.id,
      name: p.name,
      goals: parseInt(goals[p.id] ?? '0') || 0,
      performance: parseFloat(perf[p.id] ?? '5') || 5,
    }))

  return {
    date: input.matchDate,
    type: input.matchType,
    name: input.matchName.trim() || undefined,
    teamAScore: input.teamAScore,
    teamBScore: input.teamBScore,
    teamA: buildTeamPlayers(input.teamA, input.goalsA, input.perfA),
    teamB: buildTeamPlayers(input.teamB, input.goalsB, input.perfB),
    shirtsResponsibleId: input.shirtsResponsibleId,
  }
}
