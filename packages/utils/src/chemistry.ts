import type { MatchPerformanceLike, PlayerInfo } from '@fulbito/types'

import { onlyFinalMatches } from './match'

// Below this many shared games, a chemistry/form reading is mostly noise; above it,
// it approaches full confidence asymptotically without ever fully overriding the manual rating.
const MIN_GAMES_FOR_CONFIDENCE = 5

// Caps how much of a player's balancing skill can come from measured history vs. the manual rating.
const HISTORY_WEIGHT = 0.3

type Result = 'win' | 'loss' | 'draw'

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function avg(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length
}

function clampPerformance(v: number): number {
  return Math.max(1, Math.min(10, v))
}

function confidence(games: number): number {
  return games / (games + MIN_GAMES_FOR_CONFIDENCE)
}

function resultFor(m: MatchPerformanceLike, inTeamA: boolean): Result {
  if (m.teamAScore === m.teamBScore) return 'draw'
  const aWon = m.teamAScore > m.teamBScore
  return aWon === inTeamA ? 'win' : 'loss'
}

function winRate(results: Result[]): number {
  if (results.length === 0) return 0.5
  const wins = results.filter(r => r === 'win').length
  const draws = results.filter(r => r === 'draw').length
  return (wins + draws * 0.5) / results.length
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

export function computePlayerHistoricalForm(
  playerId: string,
  matches: MatchPerformanceLike[]
): { medianPerformance: number; games: number } | null {
  const finals = onlyFinalMatches(matches)
  const performances: number[] = []
  for (const m of finals) {
    const mp = [...m.teamA, ...m.teamB].find(p => p.id === playerId)
    if (mp) performances.push(clampPerformance(mp.performance))
  }
  return performances.length === 0 ? null : { medianPerformance: median(performances), games: performances.length }
}

/**
 * Blends each player's manual skill with their historical median performance,
 * shrinking the historical influence toward 0 until they have a track record.
 */
export function enrichPlayersWithHistory(players: PlayerInfo[], matches: MatchPerformanceLike[]): PlayerInfo[] {
  return players.map(p => {
    const form = computePlayerHistoricalForm(p.id, matches)
    if (!form) return p
    const baseSkill = p.skill === 'unknown' ? 5 : p.skill
    const weight = HISTORY_WEIGHT * confidence(form.games)
    const effectiveSkill = baseSkill * (1 - weight) + form.medianPerformance * weight
    return { ...p, skill: effectiveSkill }
  })
}

function computePairChemistry(aId: string, bId: string, finals: MatchPerformanceLike[]): number {
  const togetherResults: Result[] = []
  const togetherPerf: number[] = []
  const apartResults: Result[] = []
  const apartPerf: number[] = []

  for (const m of finals) {
    const mpA = [...m.teamA, ...m.teamB].find(p => p.id === aId)
    const mpB = [...m.teamA, ...m.teamB].find(p => p.id === bId)
    if (!mpA && !mpB) continue

    const aInA = m.teamA.some(p => p.id === aId)
    const bInA = m.teamA.some(p => p.id === bId)

    if (mpA && mpB) {
      if (aInA === bInA) {
        togetherResults.push(resultFor(m, aInA))
        togetherPerf.push((clampPerformance(mpA.performance) + clampPerformance(mpB.performance)) / 2)
      } else {
        apartResults.push(resultFor(m, aInA), resultFor(m, bInA))
        apartPerf.push(clampPerformance(mpA.performance), clampPerformance(mpB.performance))
      }
      continue
    }
    if (mpA) {
      apartResults.push(resultFor(m, aInA))
      apartPerf.push(clampPerformance(mpA.performance))
    } else if (mpB) {
      apartResults.push(resultFor(m, bInA))
      apartPerf.push(clampPerformance(mpB.performance))
    }
  }

  if (togetherResults.length === 0) return 0

  const winRateDelta = winRate(togetherResults) - winRate(apartResults)
  const perfDelta = apartPerf.length === 0 ? 0 : (avg(togetherPerf) - avg(apartPerf)) / 9
  const raw = (winRateDelta + perfDelta) / 2
  return Math.max(-1, Math.min(1, raw * confidence(togetherResults.length)))
}

export type ChemistryMatrix = Map<string, number>

export function buildChemistryMatrix(players: PlayerInfo[], matches: MatchPerformanceLike[]): ChemistryMatrix {
  const finals = onlyFinalMatches(matches)
  const matrix: ChemistryMatrix = new Map()
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const score = computePairChemistry(players[i].id, players[j].id, finals)
      if (score !== 0) matrix.set(pairKey(players[i].id, players[j].id), score)
    }
  }
  return matrix
}

export function computeTeamChemistry(playerIds: string[], matrix: ChemistryMatrix): number {
  if (playerIds.length < 2) return 0
  let sum = 0
  let pairs = 0
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      sum += matrix.get(pairKey(playerIds[i], playerIds[j])) ?? 0
      pairs++
    }
  }
  return pairs === 0 ? 0 : sum / pairs
}
