export type MatchLike = {
  date: string
  teamAScore: number
  teamBScore: number
  teamA: { id: string }[]
  teamB: { id: string }[]
}

function relevantSorted(matches: MatchLike[], playerId: string) {
  return matches
    .filter(m => m.teamA.some(p => p.id === playerId) || m.teamB.some(p => p.id === playerId))
    .sort((a, b) => (a.date < b.date ? 1 : -1)) // newest first
}

function resultForPlayer(m: MatchLike, playerId: string): 'win' | 'loss' | 'draw' {
  const inA = m.teamA.some(p => p.id === playerId)
  const a = m.teamAScore, b = m.teamBScore
  if (a === b) return 'draw'
  if (inA) return a > b ? 'win' : 'loss'
  return b > a ? 'win' : 'loss'
}

// Current streak (draw breaks / yields 0)
export function calculateCurrentStreakForPlayer(matches: MatchLike[], playerId: string): { kind: 'win' | 'loss' | null, count: number } {
  const arr = relevantSorted(matches, playerId)
  let kind: 'win' | 'loss' | null = null
  let count = 0
  for (const m of arr) {
    const r = resultForPlayer(m, playerId)
    if (r === 'draw') return { kind: null, count: 0 }
    if (!kind) {
      kind = r
      count = 1
    } else if (r === kind) {
      count++
    } else {
      break
    }
  }
  return { kind, count }
}

export function calculateAllCurrentStreaks(matches: MatchLike[]): Record<string, { kind: 'win' | 'loss' | null, count: number }> {
  const ids = new Set<string>()
  for (const m of matches) {
    m.teamA.forEach(p => ids.add(p.id))
    m.teamB.forEach(p => ids.add(p.id))
  }
  const out: Record<string, { kind: 'win' | 'loss' | null, count: number }> = {}
  ids.forEach(id => { out[id] = calculateCurrentStreakForPlayer(matches, id) })
  return out
}