import type { Match, Player } from '@fulbito/types'
import { computePlayerStatRows, pickAwardWinners, type AwardAccent, type AwardWinner } from '@fulbito/utils'
import { useMemo, useState } from 'react'

export type { AwardAccent, AwardWinner }

export type AwardIcon =
  | { lib: 'ionicons'; name: 'star' }
  | { lib: 'mci'; name: 'run' | 'emoticon-sad-outline' | 'washing-machine' | 'soccer' }

export function useAnnualAwards(players: Player[], matches: Match[]) {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  const availableYears = useMemo(() => {
    const years = new Set(matches.map((m) => new Date(m.date).getFullYear()))
    years.add(new Date().getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [matches])

  const yearMatches = useMemo(
    () => matches.filter((m) => new Date(m.date).getFullYear() === selectedYear),
    [matches, selectedYear],
  )

  const winners = useMemo(
    () => pickAwardWinners(computePlayerStatRows(players, yearMatches)),
    [players, yearMatches],
  )

  return {
    currentYear: selectedYear,
    availableYears,
    onSelectYear: setSelectedYear,
    winners,
  }
}
