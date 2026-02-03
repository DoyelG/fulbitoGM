export type Skill = number | 'unknown'

export type PlayerInfo = {
  id: string
  name: string
  skill: Skill
  position?: string
  physical?: Skill
}

export type TeamResult = {
  players: PlayerInfo[]
  totalSkill: number
  totalPhysical: number
}

const norm = (s: Skill) => (s === 'unknown' ? 5 : s)

/**
 * Balanced split with slight randomness for regenerate.
 */
const normPhysical = (p: PlayerInfo) => (p.physical === undefined || p.physical === 'unknown' ? 5 : p.physical)

function sumSkill(team: PlayerInfo[]) {
  return team.reduce((s, p) => s + norm(p.skill), 0)
}
function sumPhysical(team: PlayerInfo[]) {
  return team.reduce((s, p) => s + normPhysical(p), 0)
}

/**
 * Ensures that the team with less skill has >= physical than the other team (counteract disparity).
 * Swaps players until the invariant is met.
 */
function applyPhysicalCompensation(
  teamA: PlayerInfo[],
  teamB: PlayerInfo[]
): { skillA: number; skillB: number; physicalA: number; physicalB: number } {
  const getPhys = (p: PlayerInfo) => normPhysical(p)

  const maxIterations = teamA.length * teamB.length + 1
  for (let iter = 0; iter < maxIterations; iter++) {
    const skillA = sumSkill(teamA)
    const skillB = sumSkill(teamB)
    const physicalA = sumPhysical(teamA)
    const physicalB = sumPhysical(teamB)

    const invariantOk =
      !(skillA < skillB && physicalA < physicalB) && !(skillB < skillA && physicalB < physicalA)
    if (invariantOk) break

    let swapped = false

    if (skillA < skillB && physicalA < physicalB) {
      const iA = teamA.reduce((best, p, i) => getPhys(p) < getPhys(teamA[best]) ? i : best, 0)
      const jB = teamB.reduce((best, p, i) => getPhys(p) > getPhys(teamB[best]) ? i : best, 0)
      const pA = teamA[iA]
      const pB = teamB[jB]
      if (getPhys(pB) > getPhys(pA)) {
        teamA[iA] = pB
        teamB[jB] = pA
        swapped = true
      }
    }

    if (!swapped && skillB < skillA && physicalB < physicalA) {
      const jB = teamB.reduce((best, p, i) => getPhys(p) < getPhys(teamB[best]) ? i : best, 0)
      const iA = teamA.reduce((best, p, i) => getPhys(p) > getPhys(teamA[best]) ? i : best, 0)
      const pB = teamB[jB]
      const pA = teamA[iA]
      if (getPhys(pA) > getPhys(pB)) {
        teamB[jB] = pA
        teamA[iA] = pB
        swapped = true
      }
    }

    if (!swapped) break
  }

  return {
    skillA: sumSkill(teamA),
    skillB: sumSkill(teamB),
    physicalA: sumPhysical(teamA),
    physicalB: sumPhysical(teamB)
  }
}


export function balanceTeams(selectedPlayers: PlayerInfo[], playersPerTeam: number): { teamA: TeamResult, teamB: TeamResult } {
  const withBalance = selectedPlayers.map(p => ({
    ...p,
    balanceSkill: norm(p.skill),
    balancePhysical: normPhysical(p)
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
    if (teamA.length === playersPerTeam) {
      teamB.push(p)
      physicalB += phys
      continue
    }
    if (teamB.length === playersPerTeam) {
      teamA.push(p)
      physicalA += phys
      continue
    }
    if (physicalA <= physicalB) {
      teamA.push(p)
      physicalA += phys
    } else {
      teamB.push(p)
      physicalB += phys
    }
  }

  const compensated = applyPhysicalCompensation(teamA, teamB)

  return {
    teamA: { players: teamA, totalSkill: compensated.skillA, totalPhysical: compensated.physicalA },
    teamB: { players: teamB, totalSkill: compensated.skillB, totalPhysical: compensated.physicalB }
  }
}

export function balanceRemainingPlayers(
  unassigned: PlayerInfo[],
  preTeamA: PlayerInfo[],
  preTeamB: PlayerInfo[],
  playersPerTeam: number
): { teamA: TeamResult, teamB: TeamResult } {
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
    if (spotsA === 0) {
      teamB.push(p); physicalB += phys; continue
    }
    if (spotsB === 0) {
      teamA.push(p); physicalA += phys; continue
    }
    if (physicalA <= physicalB) {
      teamA.push(p); physicalA += phys
    } else {
      teamB.push(p); physicalB += phys
    }
  }

  const compensated = applyPhysicalCompensation(teamA, teamB)

  return {
    teamA: { players: teamA, totalSkill: compensated.skillA, totalPhysical: compensated.physicalA },
    teamB: { players: teamB, totalSkill: compensated.skillB, totalPhysical: compensated.physicalB }
  }
}