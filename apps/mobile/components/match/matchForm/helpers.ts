import type { MatchInput, Player, MatchLocation, MatchType } from '@fulbito/types'
import { buildMatchSchedule } from '@fulbito/utils'

import type { RecordingPlayer } from './types'

export function toPlayerInfo(player: Player) {
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    skill: (player.skill ?? 'unknown') as number | 'unknown',
    physical: (player.skills?.physical ?? 'unknown') as number | 'unknown',
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

export function computeTeamStats(teamA: RecordingPlayer[], teamB: RecordingPlayer[], poolPlayers: Player[]): TeamStats {
  const normalizeSkill = (value: number | null | undefined) => (value == null ? 5 : value)
  const normalizePhysical = (value: number | 'unknown' | null | undefined) =>
    value === 'unknown' || value == null ? 5 : value

  const teamAIds = new Set(teamA.map((player) => player.id))
  const teamBIds = new Set(teamB.map((player) => player.id))
  const playersA = poolPlayers.filter((player) => teamAIds.has(player.id))
  const playersB = poolPlayers.filter((player) => teamBIds.has(player.id))

  const skillA = playersA.reduce((total, player) => total + normalizeSkill(player.skill), 0)
  const skillB = playersB.reduce((total, player) => total + normalizeSkill(player.skill), 0)
  const physA = playersA.reduce((total, player) => total + normalizePhysical(player.skills?.physical), 0)
  const physB = playersB.reduce((total, player) => total + normalizePhysical(player.skills?.physical), 0)

  const total = skillA + skillB
  const winPctA = total > 0 ? Math.round((skillA / total) * 100) : 50
  const winPctB = total > 0 ? 100 - winPctA : 50

  return { skillA, skillB, physA, physB, winPctA, winPctB }
}

export type BuildPayloadInput = {
  matchDate: string
  matchHour: number | null
  matchType: MatchType
  matchName: string
  matchDescription: string
  teamA: RecordingPlayer[]
  teamB: RecordingPlayer[]
  teamAScore: number
  teamBScore: number
  goalsA: Record<string, string>
  goalsB: Record<string, string>
  perfA: Record<string, string>
  perfB: Record<string, string>
  shirtsResponsibleId: string | null
  goalkeeperIds?: string[]
  mvpId?: string | null
  isMatchFriendly?: boolean
  matchLocation?: MatchLocation | null
}

export type BuildDraftPayloadInput = Omit<
  BuildPayloadInput,
  'teamAScore' | 'teamBScore' | 'goalsA' | 'goalsB' | 'perfA' | 'perfB' | 'mvpId'
>

export function buildDraftMatchPayload(input: BuildDraftPayloadInput): MatchInput {
  const toDraftPlayer = (p: RecordingPlayer) => ({ id: p.id, name: p.name, goals: 0, performance: 0 })

  return {
    ...buildMatchSchedule(input.matchDate, input.matchHour),
    type: input.matchType,
    name: input.matchName.trim() || undefined,
    location: input.matchLocation ?? undefined,
    description: input.matchDescription.trim() || undefined,
    status: 'draft',
    teamAScore: 0,
    teamBScore: 0,
    teamA: input.teamA.map(toDraftPlayer),
    teamB: input.teamB.map(toDraftPlayer),
    shirtsResponsibleId: input.shirtsResponsibleId,
    goalkeeperIds: input.goalkeeperIds ?? [],
    mvpId: null,
    isFriendly: input.isMatchFriendly ?? false,
  }
}

export function buildFinalMatchPayload(input: BuildPayloadInput): MatchInput {
  const buildTeamPlayers = (team: RecordingPlayer[], goals: Record<string, string>, perf: Record<string, string>) =>
    team.map((player) => ({
      id: player.id,
      name: player.name,
      goals: parseInt(goals[player.id] ?? '0') || 0,
      performance: parseFloat(perf[player.id] ?? '5') || 5,
    }))

  return {
    ...buildMatchSchedule(input.matchDate, input.matchHour),
    type: input.matchType,
    name: input.matchName.trim() || undefined,
    location: input.matchLocation ?? undefined,
    description: input.matchDescription.trim() || undefined,
    status: 'final',
    teamAScore: input.teamAScore,
    teamBScore: input.teamBScore,
    teamA: buildTeamPlayers(input.teamA, input.goalsA, input.perfA),
    teamB: buildTeamPlayers(input.teamB, input.goalsB, input.perfB),
    shirtsResponsibleId: input.shirtsResponsibleId,
    goalkeeperIds: input.goalkeeperIds ?? [],
    mvpId: input.mvpId ?? null,
    isFriendly: input.isMatchFriendly ?? false,
  }
}
