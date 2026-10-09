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

    return [...stats].sort((rowA, rowB) => {
      const diff = getSortValue(rowB) - getSortValue(rowA)
      if (diff !== 0) return diff
      return rowA.name.localeCompare(rowB.name)
    })
  }, [stats, activeTab])

  const inactiveIds = useMemo(
    () => new Set(players.filter((player) => player.inactive).map((player) => player.id)),
    [players],
  )

  const activeStats = useMemo(() => sortedStats.filter((row) => !inactiveIds.has(row.id)), [sortedStats, inactiveIds])

  const inactiveStats = useMemo(() => sortedStats.filter((row) => inactiveIds.has(row.id)), [sortedStats, inactiveIds])

  return {
    activeTab,
    setActiveTab,
    stats,
    sortedStats,
    inactiveIds,
    activeStats,
    inactiveStats,
  }
}
