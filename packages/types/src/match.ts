export type MatchPlayer = {
  id: string
  name: string
  goals: number
  performance: number
}

export type MatchStatus = 'draft' | 'final'

export type MatchLocation = {
  name: string
  street: string
  addressId: string
}

export type Match = {
  id: string
  tournamentId: string
  date: string
  hasTime?: boolean
  type: string
  status?: MatchStatus
  teamAScore: number
  teamBScore: number
  teamA: MatchPlayer[]
  teamB: MatchPlayer[]
  name?: string
  opponentName?: string
  description?: string
  shirtsResponsibleId?: string | null
  mvpId?: string | null
  goalkeeperIds?: string[]
  isFriendly?: boolean
  createdAt: string
  updatedAt: string
  location?: MatchLocation | null
}

export type MyMatchEntry = { match: Match; playerId: string }

export type MatchInput = Omit<Match, 'id' | 'tournamentId' | 'createdAt' | 'updatedAt'>

export type MatchLike = {
  date: string
  teamAScore: number
  teamBScore: number
  teamA: { id: string }[]
  teamB: { id: string }[]
  isFriendly?: boolean
}

export function isDraft(match: Pick<Match, 'status'>): boolean {
  return match.status === 'draft'
}

export function isFinal(match: Pick<Match, 'status'>): boolean {
  return match.status !== 'draft'
}

export const MATCH_TYPES = ['5v5', '6v6', '7v7', '8v8', '9v9', '10v10', '11v11'] as const

export type MatchType = (typeof MATCH_TYPES)[number]
