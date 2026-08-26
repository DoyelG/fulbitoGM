import type { SkillValue, PlayerInfo, TeamResult } from '@fulbito/types'

import { computeTeamChemistry, type ChemistryMatrix } from './chemistry'
import { computePositionImbalance, sumMvpCount } from './teamValidations'

// How much a soft-balancing swap (chemistry/mvp/position, or a "regenerate" perturbation) may
// widen the skill/physical gap already achieved. 1 point turned out too tight — with typical
// player values a couple points apart, it often left "regenerate" with zero valid swaps to try.
const SOFT_BALANCE_TOLERANCE = 2

const norm = (s: SkillValue) => (s === 'unknown' ? 5 : s)

const normPhysical = (p: PlayerInfo) =>
  p.physical === undefined || p.physical === 'unknown' ? 5 : p.physical

function sumSkill(team: PlayerInfo[]) {
  return team.reduce((s, p) => s + norm(p.skill), 0)
}

function sumPhysical(team: PlayerInfo[]) {
  return team.reduce((s, p) => s + normPhysical(p), 0)
}

/**
 * True unless one team is behind in BOTH skill and physical at once — a team should lose
 * at most one of the two, never both.
 */
function noDoubleAdvantage(teamA: PlayerInfo[], teamB: PlayerInfo[]): boolean {
  const skillA = sumSkill(teamA)
  const skillB = sumSkill(teamB)
  const physicalA = sumPhysical(teamA)
  const physicalB = sumPhysical(teamB)
  return !(skillA < skillB && physicalA < physicalB) && !(skillB < skillA && physicalB < physicalA)
}

/**
 * Ensures that the team with less skill does not also have less physical (and vice versa) —
 * a team should lose at most one of the two dimensions, never both. Searches every possible
 * swap each iteration (not just one heuristic candidate) and takes whichever one fixes the
 * invariant while keeping skill/physical as close as possible. Not always achievable (e.g. skill
 * and physical are perfectly correlated across the whole pool), but this finds a fix whenever one exists.
 */
function applyPhysicalCompensation(
  teamA: PlayerInfo[],
  teamB: PlayerInfo[]
): { skillA: number; skillB: number; physicalA: number; physicalB: number } {
  const maxIterations = teamA.length * teamB.length + 1

  for (let iter = 0; iter < maxIterations; iter++) {
    if (noDoubleAdvantage(teamA, teamB)) break

    let bestSwap: { i: number; j: number; score: number } | null = null
    for (let i = 0; i < teamA.length; i++) {
      for (let j = 0; j < teamB.length; j++) {
        const nextA = [...teamA]
        const nextB = [...teamB]
        ;[nextA[i], nextB[j]] = [nextB[j], nextA[i]]
        if (!noDoubleAdvantage(nextA, nextB)) continue

        const score = Math.abs(sumSkill(nextA) - sumSkill(nextB)) + Math.abs(sumPhysical(nextA) - sumPhysical(nextB))
        if (!bestSwap || score < bestSwap.score) bestSwap = { i, j, score }
      }
    }
    if (!bestSwap) break
    ;[teamA[bestSwap.i], teamB[bestSwap.j]] = [teamB[bestSwap.j], teamA[bestSwap.i]]
  }

  return {
    skillA: sumSkill(teamA),
    skillB: sumSkill(teamB),
    physicalA: sumPhysical(teamA),
    physicalB: sumPhysical(teamB),
  }
}

/**
 * Tries player-for-player swaps that shrink `gapOf` between teams, keeping every swap
 * within `isWithinGuards` so later, softer criteria never undo earlier, more important ones.
 */
function optimizeBySwap(
  teamA: PlayerInfo[],
  teamB: PlayerInfo[],
  gapOf: (a: PlayerInfo[], b: PlayerInfo[]) => number,
  isWithinGuards: (a: PlayerInfo[], b: PlayerInfo[]) => boolean
): void {
  const maxIterations = teamA.length * teamB.length

  for (let iter = 0; iter < maxIterations; iter++) {
    const gap = gapOf(teamA, teamB)
    if (gap < 0.01) break

    let bestSwap: { i: number; j: number; newGap: number } | null = null
    for (let i = 0; i < teamA.length; i++) {
      for (let j = 0; j < teamB.length; j++) {
        const nextA = [...teamA]
        const nextB = [...teamB]
        ;[nextA[i], nextB[j]] = [nextB[j], nextA[i]]
        if (!isWithinGuards(nextA, nextB)) continue

        const newGap = gapOf(nextA, nextB)
        if (newGap < gap - 0.001 && (!bestSwap || newGap < bestSwap.newGap)) {
          bestSwap = { i, j, newGap }
        }
      }
    }
    if (!bestSwap) break
    ;[teamA[bestSwap.i], teamB[bestSwap.j]] = [teamB[bestSwap.j], teamA[bestSwap.i]]
  }
}

/**
 * Guard shared by every soft-balancing swap below: never let one team lose both skill and
 * physical, and never widen the skill/physical gap beyond what's already been achieved.
 */
function withinTolerance(
  skillTolerance: number,
  physicalTolerance: number
): (a: PlayerInfo[], b: PlayerInfo[]) => boolean {
  return (a, b) =>
    noDoubleAdvantage(a, b) &&
    Math.abs(sumSkill(a) - sumSkill(b)) <= skillTolerance &&
    Math.abs(sumPhysical(a) - sumPhysical(b)) <= physicalTolerance
}

/**
 * Chemistry, MVP and position are "soft" signals: worth balancing, but never worth undoing
 * the skill/physical balance for. Each runs its own swap search in priority order, guarded by
 * the same fixed skill/physical tolerance captured once before any of them start.
 */
function applySoftBalancing(
  teamA: PlayerInfo[],
  teamB: PlayerInfo[],
  chemistry: ChemistryMatrix | undefined,
  mvpCounts: Map<string, number> | undefined
): void {
  const guard = withinTolerance(
    Math.abs(sumSkill(teamA) - sumSkill(teamB)) + SOFT_BALANCE_TOLERANCE,
    Math.abs(sumPhysical(teamA) - sumPhysical(teamB)) + SOFT_BALANCE_TOLERANCE
  )

  const metrics: Array<(a: PlayerInfo[], b: PlayerInfo[]) => number> = []
  if (chemistry) {
    metrics.push((a, b) =>
      Math.abs(computeTeamChemistry(a.map(p => p.id), chemistry) - computeTeamChemistry(b.map(p => p.id), chemistry))
    )
  }
  if (mvpCounts) {
    metrics.push((a, b) => Math.abs(sumMvpCount(a.map(p => p.id), mvpCounts) - sumMvpCount(b.map(p => p.id), mvpCounts)))
  }
  metrics.push(computePositionImbalance)

  for (const gapOf of metrics) optimizeBySwap(teamA, teamB, gapOf, guard)
}

function toTeamResults(
  teamA: PlayerInfo[],
  teamB: PlayerInfo[],
  chemistry: ChemistryMatrix | undefined
): { teamA: TeamResult; teamB: TeamResult } {
  return {
    teamA: {
      players: teamA,
      totalSkill: sumSkill(teamA),
      totalPhysical: sumPhysical(teamA),
      ...(chemistry ? { chemistry: computeTeamChemistry(teamA.map(p => p.id), chemistry) } : {}),
    },
    teamB: {
      players: teamB,
      totalSkill: sumSkill(teamB),
      totalPhysical: sumPhysical(teamB),
      ...(chemistry ? { chemistry: computeTeamChemistry(teamB.map(p => p.id), chemistry) } : {}),
    },
  }
}

function finalizeTeams(
  teamA: PlayerInfo[],
  teamB: PlayerInfo[],
  chemistry: ChemistryMatrix | undefined,
  mvpCounts: Map<string, number> | undefined
): { teamA: TeamResult; teamB: TeamResult } {
  applyPhysicalCompensation(teamA, teamB)
  applySoftBalancing(teamA, teamB, chemistry, mvpCounts)

  return toTeamResults(teamA, teamB, chemistry)
}

/**
 * Perturbs the CURRENT lineup with one random valid swap, instead of recomputing from
 * scratch — re-running the full balance search tends to converge back to the same (or an
 * equivalent) optimum, which makes "regenerate" a no-op in practice. Only swaps that keep the
 * skill/physical invariant already achieved are considered, so the result is always a
 * different lineup that is still fair.
 */
export function shuffleTeams(
  teamA: PlayerInfo[],
  teamB: PlayerInfo[],
  chemistry?: ChemistryMatrix
): { teamA: TeamResult; teamB: TeamResult } {
  const nextA = [...teamA]
  const nextB = [...teamB]
  const isWithinGuards = withinTolerance(
    Math.abs(sumSkill(nextA) - sumSkill(nextB)) + SOFT_BALANCE_TOLERANCE,
    Math.abs(sumPhysical(nextA) - sumPhysical(nextB)) + SOFT_BALANCE_TOLERANCE
  )

  const candidates: Array<[number, number]> = []
  for (let i = 0; i < nextA.length; i++) {
    for (let j = 0; j < nextB.length; j++) {
      const swappedA = [...nextA]
      const swappedB = [...nextB]
      ;[swappedA[i], swappedB[j]] = [swappedB[j], swappedA[i]]
      if (isWithinGuards(swappedA, swappedB)) candidates.push([i, j])
    }
  }

  if (candidates.length > 0) {
    const [i, j] = candidates[Math.floor(Math.random() * candidates.length)]
    ;[nextA[i], nextB[j]] = [nextB[j], nextA[i]]
  }

  return toTeamResults(nextA, nextB, chemistry)
}

export function balanceTeams(
  selectedPlayers: PlayerInfo[],
  playersPerTeam: number,
  chemistry?: ChemistryMatrix,
  mvpCounts?: Map<string, number>
): { teamA: TeamResult; teamB: TeamResult } {
  const withBalance = selectedPlayers.map(p => ({
    ...p,
    balanceSkill: norm(p.skill),
    balancePhysical: normPhysical(p),
  }))

  const sorted = [...withBalance].sort((a, b) => {
    const diff = b.balanceSkill - a.balanceSkill
    return diff + (Math.random() - 0.5) * 0.5
  })

  const teamA: PlayerInfo[] = []
  const teamB: PlayerInfo[] = []
  let physicalA = 0
  let physicalB = 0

  for (const p of sorted) {
    const phys = p.balancePhysical!
    if (teamA.length === playersPerTeam) { teamB.push(p); physicalB += phys; continue }
    if (teamB.length === playersPerTeam) { teamA.push(p); physicalA += phys; continue }
    if (physicalA <= physicalB) { teamA.push(p); physicalA += phys }
    else { teamB.push(p); physicalB += phys }
  }

  return finalizeTeams(teamA, teamB, chemistry, mvpCounts)
}

export function balanceRemainingPlayers(
  unassigned: PlayerInfo[],
  preTeamA: PlayerInfo[],
  preTeamB: PlayerInfo[],
  playersPerTeam: number,
  chemistry?: ChemistryMatrix,
  mvpCounts?: Map<string, number>
): { teamA: TeamResult; teamB: TeamResult } {
  const teamA = [...preTeamA]
  const teamB = [...preTeamB]
  let physicalA = teamA.reduce((s, p) => s + normPhysical(p), 0)
  let physicalB = teamB.reduce((s, p) => s + normPhysical(p), 0)

  const sortedUnassigned = unassigned
    .map(p => ({ ...p, balanceSkill: norm(p.skill), balancePhysical: normPhysical(p) }))
    .sort((a, b) => b.balanceSkill - a.balanceSkill)

  for (const p of sortedUnassigned) {
    const phys = p.balancePhysical!
    const spotsA = playersPerTeam - teamA.length
    const spotsB = playersPerTeam - teamB.length
    if (spotsA === 0) { teamB.push(p); physicalB += phys; continue }
    if (spotsB === 0) { teamA.push(p); physicalA += phys; continue }
    if (physicalA <= physicalB) { teamA.push(p); physicalA += phys }
    else { teamB.push(p); physicalB += phys }
  }

  return finalizeTeams(teamA, teamB, chemistry, mvpCounts)
}
