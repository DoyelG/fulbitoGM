import type { Player } from '@fulbito/types'
import { useCallback, useMemo, useState } from 'react'

import type { SortDir, SortKey } from '@/components/players/players-list-header'

type StreakKind = 'win' | 'loss' | null
type StreakInfo = { kind: StreakKind; count: number }

const EMPTY_STREAK: StreakInfo = { kind: null, count: 0 }

function streakScore(streak: StreakInfo): number {
  if (streak.kind === 'win') return streak.count
  if (streak.kind === 'loss') return -streak.count
  return 0
}

export function usePlayerSort(
  players: Player[],
  streaks: Record<string, StreakInfo>,
  initial: SortKey = 'skill',
) {
  const [sortKey, setSortKey] = useState<SortKey>(initial)
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return prevKey
      }
      setSortDir('desc')
      return key
    })
  }, [])

  const sortedPlayers = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...players].sort((a, b) => {
      const stA = streaks[a.id] ?? EMPTY_STREAK
      const stB = streaks[b.id] ?? EMPTY_STREAK
      const goalA = stA.kind === 'win' ? stA.count : 0
      const goalB = stB.kind === 'win' ? stB.count : 0

      let av: number
      let bv: number
      switch (sortKey) {
        case 'skill':
          av = a.skill ?? -Infinity
          bv = b.skill ?? -Infinity
          break
        case 'streak':
          av = streakScore(stA)
          bv = streakScore(stB)
          break
        case 'goal7':
          av = goalA
          bv = goalB
          break
      }
      if (av === bv) return 0
      return av > bv ? dir : -dir
    })
  }, [players, streaks, sortKey, sortDir])

  return { sortKey, sortDir, toggleSort, sortedPlayers }
}
