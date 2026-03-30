export type MatchPlayer = {
  id: string
  name: string
  goals: number
  performance: number
}

export type Match = {
  id: string
  date: string
  type: string
  teamAScore: number
  teamBScore: number
  teamA: MatchPlayer[]
  teamB: MatchPlayer[]
  name?: string
  shirtsResponsibleId?: string | null
}

/** Minimal match shape used by streak-calculation algorithms */
export type MatchLike = {
  date: string
  teamAScore: number
  teamBScore: number
  teamA: { id: string }[]
  teamB: { id: string }[]
}
