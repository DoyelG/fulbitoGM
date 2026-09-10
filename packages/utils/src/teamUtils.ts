import type { SkillValue, PlayerInfo, TeamResult } from '@fulbito/types'

const norm = (s: SkillValue) => (s === 'unknown' ? 5 : s)

const normPhysical = (p: PlayerInfo) => (p.physical === undefined || p.physical === 'unknown' ? 5 : p.physical)

const PHYSICAL_IMBALANCE_WEIGHT = 1
const SKILL_SORT_JITTER = 0.5
const SWAP_EXPLORATION_TOLERANCE = 1

function sumSkill(team: PlayerInfo[]) {
  return team.reduce((s, p) => s + norm(p.skill), 0)
}

function sumPhysical(team: PlayerInfo[]) {
  return team.reduce((s, p) => s + normPhysical(p), 0)
}

function imbalanceScore(skillA: number, skillB: number, physicalA: number, physicalB: number) {
  return Math.abs(skillA - skillB) + PHYSICAL_IMBALANCE_WEIGHT * Math.abs(physicalA - physicalB)
}

type SwapConstraints = {
  hardLockedIds: Set<string>
  goalkeeperIds: Set<string>
  hotStreakIds: Set<string>
}

function categorySpreadAfterSwap(
  teamA: PlayerInfo[],
  teamB: PlayerInfo[],
  candidateFromA: PlayerInfo,
  candidateFromB: PlayerInfo,
  isInCategory: (p: PlayerInfo) => boolean,
): { spreadBeforeSwap: number; spreadAfterSwap: number } {
  const countA = teamA.filter(isInCategory).length
  const countB = teamB.filter(isInCategory).length
  const countAAfterSwap = countA - (isInCategory(candidateFromA) ? 1 : 0) + (isInCategory(candidateFromB) ? 1 : 0)
  const countBAfterSwap = countB - (isInCategory(candidateFromB) ? 1 : 0) + (isInCategory(candidateFromA) ? 1 : 0)
  return {
    spreadBeforeSwap: Math.abs(countA - countB),
    spreadAfterSwap: Math.abs(countAAfterSwap - countBAfterSwap),
  }
}

function swapKeepsDistributionConstraints(
  teamA: PlayerInfo[],
  teamB: PlayerInfo[],
  candidateFromA: PlayerInfo,
  candidateFromB: PlayerInfo,
  constraints: SwapConstraints,
): boolean {
  if (constraints.hardLockedIds.has(candidateFromA.id) || constraints.hardLockedIds.has(candidateFromB.id)) {
    return false
  }

  const isGoalkeeper = (p: PlayerInfo) => constraints.goalkeeperIds.has(p.id)
  const goalkeeperSpread = categorySpreadAfterSwap(teamA, teamB, candidateFromA, candidateFromB, isGoalkeeper)
  if (goalkeeperSpread.spreadAfterSwap > goalkeeperSpread.spreadBeforeSwap) return false

  const isHotStreakPlayer = (p: PlayerInfo) => constraints.hotStreakIds.has(p.id)
  const hotStreakSpread = categorySpreadAfterSwap(teamA, teamB, candidateFromA, candidateFromB, isHotStreakPlayer)
  if (hotStreakSpread.spreadAfterSwap > hotStreakSpread.spreadBeforeSwap) return false

  return true
}

function minimizeImbalanceBySwapping(
  teamA: PlayerInfo[],
  teamB: PlayerInfo[],
  constraints: SwapConstraints,
): { skillA: number; skillB: number; physicalA: number; physicalB: number } {
  const maxSwapAttempts = teamA.length * teamB.length + 1

  for (let attempt = 0; attempt < maxSwapAttempts; attempt++) {
    const skillA = sumSkill(teamA)
    const skillB = sumSkill(teamB)
    const physicalA = sumPhysical(teamA)
    const physicalB = sumPhysical(teamB)
    const scoreBeforeSwap = imbalanceScore(skillA, skillB, physicalA, physicalB)

    const improvingSwaps: { teamAIndex: number; teamBIndex: number; scoreAfterSwap: number }[] = []
    let bestScoreAfterSwap = scoreBeforeSwap

    for (let teamAIndex = 0; teamAIndex < teamA.length; teamAIndex++) {
      for (let teamBIndex = 0; teamBIndex < teamB.length; teamBIndex++) {
        const candidateFromA = teamA[teamAIndex]
        const candidateFromB = teamB[teamBIndex]
        if (!swapKeepsDistributionConstraints(teamA, teamB, candidateFromA, candidateFromB, constraints)) continue

        const skillAAfterSwap = skillA - norm(candidateFromA.skill) + norm(candidateFromB.skill)
        const skillBAfterSwap = skillB - norm(candidateFromB.skill) + norm(candidateFromA.skill)
        const physicalAAfterSwap = physicalA - normPhysical(candidateFromA) + normPhysical(candidateFromB)
        const physicalBAfterSwap = physicalB - normPhysical(candidateFromB) + normPhysical(candidateFromA)
        const scoreAfterSwap = imbalanceScore(skillAAfterSwap, skillBAfterSwap, physicalAAfterSwap, physicalBAfterSwap)

        if (scoreAfterSwap < scoreBeforeSwap) {
          improvingSwaps.push({ teamAIndex, teamBIndex, scoreAfterSwap })
          if (scoreAfterSwap < bestScoreAfterSwap) bestScoreAfterSwap = scoreAfterSwap
        }
      }
    }

    if (improvingSwaps.length === 0) break

    const nearBestSwaps = improvingSwaps.filter(
      (swap) => swap.scoreAfterSwap <= bestScoreAfterSwap + SWAP_EXPLORATION_TOLERANCE,
    )
    const chosenSwap = nearBestSwaps[Math.floor(Math.random() * nearBestSwaps.length)]

    const playerMovingToB = teamA[chosenSwap.teamAIndex]
    teamA[chosenSwap.teamAIndex] = teamB[chosenSwap.teamBIndex]
    teamB[chosenSwap.teamBIndex] = playerMovingToB
  }

  return {
    skillA: sumSkill(teamA),
    skillB: sumSkill(teamB),
    physicalA: sumPhysical(teamA),
    physicalB: sumPhysical(teamB),
  }
}

export function balanceTeams(
  selectedPlayers: PlayerInfo[],
  playersPerTeam: number,
): { teamA: TeamResult; teamB: TeamResult } {
  const withBalance = selectedPlayers.map((p) => ({
    ...p,
    balanceSkill: norm(p.skill),
    balancePhysical: normPhysical(p),
  }))

  const sorted = [...withBalance].sort((a, b) => {
    const diff = b.balanceSkill - a.balanceSkill
    return diff + (Math.random() - 0.5) * SKILL_SORT_JITTER
  })

  const teamA: PlayerInfo[] = []
  const teamB: PlayerInfo[] = []
  let skillA = 0
  let skillB = 0
  let physicalA = 0
  let physicalB = 0

  for (const p of sorted) {
    const skill = p.balanceSkill
    const physical = p.balancePhysical
    if (teamA.length === playersPerTeam) {
      teamB.push(p)
      skillB += skill
      physicalB += physical
      continue
    }
    if (teamB.length === playersPerTeam) {
      teamA.push(p)
      skillA += skill
      physicalA += physical
      continue
    }
    if (skillA < skillB || (skillA === skillB && physicalA <= physicalB)) {
      teamA.push(p)
      skillA += skill
      physicalA += physical
    } else {
      teamB.push(p)
      skillB += skill
      physicalB += physical
    }
  }

  const balanced = minimizeImbalanceBySwapping(teamA, teamB, {
    hardLockedIds: new Set(),
    goalkeeperIds: new Set(),
    hotStreakIds: new Set(),
  })
  return {
    teamA: { players: teamA, totalSkill: balanced.skillA, totalPhysical: balanced.physicalA },
    teamB: { players: teamB, totalSkill: balanced.skillB, totalPhysical: balanced.physicalB },
  }
}

export function balanceRemainingPlayers(
  unassigned: PlayerInfo[],
  preTeamA: PlayerInfo[],
  preTeamB: PlayerInfo[],
  playersPerTeam: number,
  opts: {
    hardLockedIds?: Set<string>
    goalkeeperIds?: Set<string>
    hotStreakIds?: Set<string>
  } = {},
): { teamA: TeamResult; teamB: TeamResult } {
  const teamA = [...preTeamA]
  const teamB = [...preTeamB]

  let skillA = sumSkill(teamA)
  let skillB = sumSkill(teamB)
  let physicalA = sumPhysical(teamA)
  let physicalB = sumPhysical(teamB)

  const sortedUnassigned = unassigned
    .map((p) => ({ ...p, balanceSkill: norm(p.skill), balancePhysical: normPhysical(p) }))
    .sort((a, b) => {
      const diff = b.balanceSkill - a.balanceSkill
      return diff + (Math.random() - 0.5) * SKILL_SORT_JITTER
    })

  for (const p of sortedUnassigned) {
    const skill = p.balanceSkill
    const physical = p.balancePhysical
    const openSpotsA = playersPerTeam - teamA.length
    const openSpotsB = playersPerTeam - teamB.length
    if (openSpotsA === 0) {
      teamB.push(p)
      skillB += skill
      physicalB += physical
      continue
    }
    if (openSpotsB === 0) {
      teamA.push(p)
      skillA += skill
      physicalA += physical
      continue
    }
    if (skillA < skillB || (skillA === skillB && physicalA <= physicalB)) {
      teamA.push(p)
      skillA += skill
      physicalA += physical
    } else {
      teamB.push(p)
      skillB += skill
      physicalB += physical
    }
  }

  const balanced = minimizeImbalanceBySwapping(teamA, teamB, {
    hardLockedIds: opts.hardLockedIds ?? new Set(),
    goalkeeperIds: opts.goalkeeperIds ?? new Set(),
    hotStreakIds: opts.hotStreakIds ?? new Set(),
  })
  return {
    teamA: { players: teamA, totalSkill: balanced.skillA, totalPhysical: balanced.physicalA },
    teamB: { players: teamB, totalSkill: balanced.skillB, totalPhysical: balanced.physicalB },
  }
}

function seedByCategoryBalance(
  candidates: PlayerInfo[],
  seedA: PlayerInfo[],
  seedB: PlayerInfo[],
  playersPerTeam: number,
  isInCategory: (p: PlayerInfo) => boolean,
): { seedA: PlayerInfo[]; seedB: PlayerInfo[] } {
  const nextSeedA = [...seedA]
  const nextSeedB = [...seedB]

  for (const p of candidates) {
    const categoryCountA = nextSeedA.filter(isInCategory).length
    const categoryCountB = nextSeedB.filter(isInCategory).length
    const preferredSeed = categoryCountA <= categoryCountB ? nextSeedA : nextSeedB
    const otherSeed = preferredSeed === nextSeedA ? nextSeedB : nextSeedA
    if (preferredSeed.length < playersPerTeam) {
      preferredSeed.push(p)
    } else if (otherSeed.length < playersPerTeam) {
      otherSeed.push(p)
    }
  }

  return { seedA: nextSeedA, seedB: nextSeedB }
}

export type StreakInfo = { kind: 'win' | 'loss' | null; count: number }

export function getHotStreakIds(
  pool: PlayerInfo[],
  streaks: Record<string, StreakInfo>,
  hotStreakThreshold = 4,
): Set<string> {
  return new Set(
    pool
      .filter((p) => streaks[p.id]?.kind === 'win' && (streaks[p.id]?.count ?? 0) >= hotStreakThreshold)
      .map((p) => p.id),
  )
}

export function seedPriorityPlayers(
  pool: PlayerInfo[],
  playersPerTeam: number,
  opts: {
    goalkeeperIds?: Set<string>
    streaks?: Record<string, StreakInfo>
    hotStreakThreshold?: number
    initialSeedA?: PlayerInfo[]
    initialSeedB?: PlayerInfo[]
  } = {},
): { seedA: PlayerInfo[]; seedB: PlayerInfo[]; rest: PlayerInfo[]; hadStreakSeed: boolean } {
  const goalkeeperIds = opts.goalkeeperIds ?? new Set<string>()
  const streaks = opts.streaks ?? {}
  const hotStreakThreshold = opts.hotStreakThreshold ?? 4
  const pinnedSeedA = opts.initialSeedA ?? []
  const pinnedSeedB = opts.initialSeedB ?? []
  const pinnedIds = new Set([...pinnedSeedA, ...pinnedSeedB].map((p) => p.id))

  const unpinnedPool = pool.filter((p) => !pinnedIds.has(p.id))
  const isGoalkeeper = (p: PlayerInfo) => goalkeeperIds.has(p.id)

  const goalkeepers = unpinnedPool.filter(isGoalkeeper).sort((a, b) => norm(b.skill) - norm(a.skill))
  const seededWithGoalkeepers = seedByCategoryBalance(goalkeepers, pinnedSeedA, pinnedSeedB, playersPerTeam, isGoalkeeper)

  const goalkeeperIdsSeeded = new Set(goalkeepers.map((p) => p.id))
  const hotStreakIdsInPool = getHotStreakIds(unpinnedPool, streaks, hotStreakThreshold)
  const isHotStreakPlayer = (p: PlayerInfo) => hotStreakIdsInPool.has(p.id)
  const hotStreakPlayers = unpinnedPool
    .filter((p) => !goalkeeperIdsSeeded.has(p.id) && isHotStreakPlayer(p))
    .sort((a, b) => (streaks[b.id]?.count ?? 0) - (streaks[a.id]?.count ?? 0))
  const seededWithHotStreaks = seedByCategoryBalance(
    hotStreakPlayers,
    seededWithGoalkeepers.seedA,
    seededWithGoalkeepers.seedB,
    playersPerTeam,
    isHotStreakPlayer,
  )

  const seededIds = new Set([...seededWithHotStreaks.seedA, ...seededWithHotStreaks.seedB].map((p) => p.id))
  const rest = pool.filter((p) => !seededIds.has(p.id))

  const hotStreakIds = new Set(hotStreakPlayers.map((p) => p.id))
  const hotStreakPlayersLandedOnBothTeams =
    seededWithHotStreaks.seedA.some((p) => hotStreakIds.has(p.id)) &&
    seededWithHotStreaks.seedB.some((p) => hotStreakIds.has(p.id))

  return {
    seedA: seededWithHotStreaks.seedA,
    seedB: seededWithHotStreaks.seedB,
    rest,
    hadStreakSeed: hotStreakPlayersLandedOnBothTeams,
  }
}
