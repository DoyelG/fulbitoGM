export type Skill = number | 'unknown'

export type PlayerInfo = {
  id: string
  name: string
  skill: Skill
  position?: string
}

export type TeamResult = {
  players: PlayerInfo[]
  totalSkill: number
}

const norm = (s: Skill) => (s === 'unknown' ? 5 : s)

/**
 * Balanced split with slight randomness for regenerate.
 */
export function balanceTeams(selectedPlayers: PlayerInfo[], playersPerTeam: number): { teamA: TeamResult, teamB: TeamResult } {
  const withBalance = selectedPlayers.map(p => ({ ...p, balanceSkill: norm(p.skill) }))
  const sorted = [...withBalance].sort((a, b) => {
    const diff = b.balanceSkill - a.balanceSkill
    return diff + (Math.random() - 0.5) * 0.5
  })

  const teamA: PlayerInfo[] = []
  const teamB: PlayerInfo[] = []
  let skillA = 0
  let skillB = 0

  for (const p of sorted) {
    if (teamA.length === playersPerTeam) {
      teamB.push(p)
      skillB += p.balanceSkill
      continue
    }
    if (teamB.length === playersPerTeam) {
      teamA.push(p)
      skillA += p.balanceSkill
      continue
    }
    if (skillA <= skillB) {
      teamA.push(p)
      skillA += p.balanceSkill
    } else {
      teamB.push(p)
      skillB += p.balanceSkill
    }
  }

  return {
    teamA: { players: teamA, totalSkill: skillA },
    teamB: { players: teamB, totalSkill: skillB }
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
  let skillA = teamA.reduce((s, p) => s + norm(p.skill), 0)
  let skillB = teamB.reduce((s, p) => s + norm(p.skill), 0)

  const sortedUnassigned = unassigned
    .map(p => ({ ...p, balanceSkill: norm(p.skill) }))
    .sort((a, b) => b.balanceSkill - a.balanceSkill)

  for (const p of sortedUnassigned) {
    const spotsA = playersPerTeam - teamA.length
    const spotsB = playersPerTeam - teamB.length
    if (spotsA === 0) {
      teamB.push(p); skillB += norm(p.skill); continue
    }
    if (spotsB === 0) {
      teamA.push(p); skillA += norm(p.skill); continue
    }
    if (skillA <= skillB) {
      teamA.push(p); skillA += norm(p.skill)
    } else {
      teamB.push(p); skillB += norm(p.skill)
    }
  }

  return {
    teamA: { players: teamA, totalSkill: skillA },
    teamB: { players: teamB, totalSkill: skillB }
  }
}