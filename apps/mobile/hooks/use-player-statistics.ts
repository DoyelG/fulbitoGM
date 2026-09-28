import type { Match, Player } from '@fulbito/types'
import { useMemo, useState } from 'react'

import { usePlayerStatRows, type PlayerStatRow } from '@/hooks/use-player-stat-rows'

export type SortTabKey = 'goals' | 'matches' | 'totalPerformance' | 'winRate' | 'mvps'

export type { PlayerStatRow }

export function usePlayerStatistics(players: Player[], matches: Match[]) {
  const [activeTab, setActiveTab] = useState<SortTabKey>('goals')
  const stats = usePlayerStatRows(players, matches)

  const sortedStats = useMemo(() => {
    const getSortValue = (row: PlayerStatRow) => {
      switch (activeTab) {
        case 'matches':
          return row.matches
        case 'totalPerformance':
          return row.totalPerformance
        case 'winRate':
          return row.matches === 0 ? 0 : row.wins / row.matches
        case 'mvps':
          return row.mvps
        case 'goals':
        default:
          return row.goals
      }
    }

    return [...stats].sort((a, b) => {
      const diff = getSortValue(b) - getSortValue(a)
      if (diff !== 0) return diff
      return a.name.localeCompare(b.name)
    })
  }, [stats, activeTab])

  return {
    activeTab,
    setActiveTab,
    stats,
    sortedStats,
  }
}
