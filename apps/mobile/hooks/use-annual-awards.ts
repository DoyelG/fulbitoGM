import type { Match, Player } from '@fulbito/types'
import { useMemo, useState } from 'react'

import { usePlayerStatRows, type PlayerStatRow } from '@/hooks/use-player-stat-rows'

export type AwardAccent = 'brand' | 'secondary' | 'muted'

export type AwardIcon =
  | { lib: 'ionicons'; name: 'ribbon' | 'star' }
  | { lib: 'mci'; name: 'run' | 'emoticon-sad-outline' | 'washing-machine' }

export type AwardDef = {
  key: string
  title: string
  subtitle: string
  unitLabel: string
  icon: AwardIcon
  accent: AwardAccent
  getValue: (row: PlayerStatRow) => number
}

export type AwardWinner = {
  def: AwardDef
  row: PlayerStatRow
  value: number
}

const AWARD_DEFS: AwardDef[] = [
  {
    key: 'matches',
    title: 'Most Matches Played',
    subtitle: 'The Iron Man',
    unitLabel: 'MATCHES',
    icon: { lib: 'mci', name: 'run' },
    accent: 'brand',
    getValue: (row) => row.matches,
  },
  {
    key: 'wins',
    title: 'Most Wins',
    subtitle: 'The Ultimate Winner',
    unitLabel: 'WINS',
    icon: { lib: 'ionicons', name: 'ribbon' },
    accent: 'brand',
    getValue: (row) => row.wins,
  },
  {
    key: 'losses',
    title: 'Fighting Spirit',
    subtitle: 'Most Losses (We still love you)',
    unitLabel: 'LOSSES',
    icon: { lib: 'mci', name: 'emoticon-sad-outline' },
    accent: 'muted',
    getValue: (row) => row.losses,
  },
  {
    key: 'shirts',
    title: 'Kit Washer of the Year',
    subtitle: 'Unsung Hero',
    unitLabel: 'WASHES',
    icon: { lib: 'mci', name: 'washing-machine' },
    accent: 'secondary',
    getValue: (row) => row.shirts,
  },
  {
    key: 'mvps',
    title: 'Most MVPs',
    subtitle: 'The undeniable star of the pitch this season.',
    unitLabel: 'MVPS',
    icon: { lib: 'ionicons', name: 'star' },
    accent: 'brand',
    getValue: (row) => row.mvps,
  },
]

function pickWinner(stats: PlayerStatRow[], def: AwardDef): AwardWinner | null {
  let top: PlayerStatRow | undefined
  for (const row of stats) {
    if (!top) {
      top = row
      continue
    }
    const diff = def.getValue(row) - def.getValue(top)
    if (diff > 0 || (diff === 0 && row.name.localeCompare(top.name) < 0)) {
      top = row
    }
  }
  if (!top) return null

  const value = def.getValue(top)
  if (value <= 0) return null

  return { def, row: top, value }
}

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

  const stats = usePlayerStatRows(players, yearMatches)

  const winners = useMemo(
    () => AWARD_DEFS.map((def) => pickWinner(stats, def)).filter((w): w is AwardWinner => w !== null),
    [stats],
  )

  return {
    currentYear: selectedYear,
    availableYears,
    onSelectYear: setSelectedYear,
    winners,
  }
}
