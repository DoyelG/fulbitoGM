import type { Match } from '@fulbito/types'
import { calculateCurrentStreakForPlayer } from '@fulbito/utils'
import { useMemo } from 'react'

import { usePlayersData } from '@/hooks/use-players-data'

export type RecentMatchEntry = {
  id: string
  date: string
  type: string
  team: 'A' | 'B'
  goals: number
  performance: number
  score: string
  result: 'W' | 'L' | 'D'
}

export type PlayerDetailStats = {
  matches: number
  goals: number
  wins: number
  losses: number
  draws: number
  avgPerformance: number
  gpm: string
  winRate: string
  recent: RecentMatchEntry[]
}

export type CatSkills = {
  physical: number
  technical: number
  tactical: number
  psychological: number
}

function computeStats(matches: Match[], playerId: string): PlayerDetailStats {
  let totalPerformance = 0
  const res: PlayerDetailStats = {
    matches: 0,
    goals: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    avgPerformance: 0,
    gpm: '0.0',
    winRate: '0.0',
    recent: [],
  }

  for (const m of matches) {
    const inA = m.teamA.find((p) => p.id === playerId)
    const inB = m.teamB.find((p) => p.id === playerId)
    if (!inA && !inB) continue

    const me = (inA ?? inB)!
    const team: 'A' | 'B' = inA ? 'A' : 'B'
    const a = m.teamAScore
    const b = m.teamBScore

    res.matches++
    res.goals += me.goals
    totalPerformance += me.performance

    let result: 'W' | 'L' | 'D'
    if (a === b) {
      res.draws++
      result = 'D'
    } else if (team === 'A') {
      if (a > b) { res.wins++; result = 'W' }
      else { res.losses++; result = 'L' }
    } else {
      if (b > a) { res.wins++; result = 'W' }
      else { res.losses++; result = 'L' }
    }

    res.recent.push({
      id: m.id,
      date: m.date,
      type: m.type,
      team,
      goals: me.goals,
      performance: me.performance,
      score: `${a} - ${b}`,
      result,
    })
  }

  res.recent.sort((x, y) => (y.date > x.date ? 1 : -1))
  res.avgPerformance = res.matches > 0 ? totalPerformance / res.matches : 0
  res.gpm = res.matches > 0 ? (res.goals / res.matches).toFixed(1) : '0.0'
  res.winRate = res.matches > 0 ? ((res.wins / res.matches) * 100).toFixed(1) : '0.0'

  return res
}

export function usePlayerDetail(playerId: string) {
  const { players, matches, loading, refreshing, error, refresh, reload } = usePlayersData()

  const player = useMemo(
    () => players.find((p) => p.id === playerId) ?? null,
    [players, playerId],
  )

  const stats = useMemo(() => computeStats(matches, playerId), [matches, playerId])

  const streak = useMemo(
    () => calculateCurrentStreakForPlayer(matches, playerId),
    [matches, playerId],
  )

  const catSkills = useMemo<CatSkills>(() => {
    if (!player) return { physical: 5, technical: 5, tactical: 5, psychological: 5 }
    const base = player.skill ?? 5
    return {
      physical: Number(player.skills?.physical ?? base),
      technical: Number(player.skills?.technical ?? base),
      tactical: Number(player.skills?.tactical ?? base),
      psychological: Number(player.skills?.psychological ?? base),
    }
  }, [player])

  const overallAvg = useMemo(
    () =>
      (catSkills.physical + catSkills.technical + catSkills.tactical + catSkills.psychological) / 4,
    [catSkills],
  )

  return {
    player,
    stats,
    streak,
    catSkills,
    overallAvg,
    loading,
    refreshing,
    error,
    refresh,
    reload,
  }
}
