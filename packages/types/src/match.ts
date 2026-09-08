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
  description?: string
  shirtsResponsibleId?: string | null
  mvpId?: string | null
  goalkeeperIds?: string[]
  isFriendly?: boolean
  createdAt: string
  updatedAt: string
}

export type MatchInput = Omit<Match, 'id' | 'createdAt' | 'updatedAt'>

export type MatchLike = {
  date: string
  teamAScore: number
  teamBScore: number
  teamA: { id: string }[]
  teamB: { id: string }[]
  isFriendly?: boolean
}

export function isDraft(m: Pick<Match, 'status'>): boolean {
  return m.status === 'draft'
}

export function isFinal(m: Pick<Match, 'status'>): boolean {
  return m.status !== 'draft'
}
