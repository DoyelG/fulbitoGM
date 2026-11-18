export type MatchPlayer = {
  id: string
  name: string
  goals: number
  performance: number
}

export type MatchStatus = 'draft' | 'final' | 'open'

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
  description?: string
  shirtsResponsibleId?: string | null
  mvpId?: string | null
  goalkeeperIds?: string[]
  isFriendly?: boolean
  createdAt: string
  updatedAt: string
  location?: MatchLocation | null
  signups?: string[]
  capacity?: number
  startsAt?: string | null
}

export type MatchInput = Omit<
  Match,
  'id' | 'tournamentId' | 'createdAt' | 'updatedAt' | 'signups' | 'capacity' | 'startsAt'
>

export type OpenMatchInput = Pick<
  Match,
  'date' | 'hasTime' | 'type' | 'name' | 'description' | 'isFriendly' | 'location'
> & {
  startsAt: string
}

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

export function isOpen(m: Pick<Match, 'status'>): boolean {
  return m.status === 'open'
}

export function isFinal(m: Pick<Match, 'status'>): boolean {
  return m.status === 'final' || m.status === undefined
}

export type MatchType = '5v5' | '6v6' | '7v7' | '8v8' | '9v9' | '10v10'
