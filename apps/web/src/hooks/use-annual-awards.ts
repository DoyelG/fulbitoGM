'use client'

import type { Match, Player } from '@fulbito/types'
import { computePlayerStatRows, pickAwardWinners } from '@fulbito/utils'
import { useMemo, useState } from 'react'

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
