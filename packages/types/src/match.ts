export type MatchPlayer = {
  id: string
  name: string
  goals: number
  performance: number
}

export type MatchStatus = 'draft' | 'final'

export type Match = {
  id: string
  date: string
  type: string
  status?: MatchStatus
  teamAScore: number
  teamBScore: number
  teamA: MatchPlayer[]
  teamB: MatchPlayer[]
  name?: string
  shirtsResponsibleId?: string | null
  mvpId?: string | null
  goalkeeperIds?: string[]
}

/** Minimal match shape used by streak-calculation algorithms */
export type MatchLike = {
  date: string
  teamAScore: number
  teamBScore: number
  teamA: { id: string }[]
  teamB: { id: string }[]
}

export function isDraft(m: Pick<Match, 'status'>): boolean {
  return m.status === 'draft'
}

export function isFinal(m: Pick<Match, 'status'>): boolean {
  return m.status !== 'draft'
}
