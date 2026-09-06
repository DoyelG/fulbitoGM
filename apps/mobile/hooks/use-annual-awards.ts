import type { Match, Player } from '@fulbito/types'
import { computeSeasonStatRows, pickAwardWinners, type AwardAccent, type AwardWinner } from '@fulbito/utils'
import { useMemo, useState } from 'react'

export type { AwardAccent, AwardWinner }

export type AwardIcon =
  | { lib: 'ionicons'; name: 'star' }
  | { lib: 'mci'; name: 'run' | 'emoticon-sad-outline' | 'washing-machine' | 'soccer' | 'trophy-broken' }

export function useAnnualAwards(players: Player[], matches: Match[]) {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  const availableYears = useMemo(() => {
    const years = new Set(matches.map((m) => new Date(m.date).getFullYear()))
    years.add(new Date().getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [matches])

  // Every match, not just the season's: streak awards count runs across seasons
  // and credit them to the year of the deciding match.
  const winners = useMemo(
    () => pickAwardWinners(computeSeasonStatRows(players, matches, selectedYear)),
    [players, matches, selectedYear],
  )

  return {
    currentYear: selectedYear,
    availableYears,
    onSelectYear: setSelectedYear,
    winners,
  }
}
