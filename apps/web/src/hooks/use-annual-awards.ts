'use client'

import type { Match, Player } from '@fulbito/types'
import { calculateAllCurrentStreaks, computePlayerStatRows, pickAwardWinners } from '@fulbito/utils'
import { useMemo, useState } from 'react'

const CHAMPIONSHIP_THRESHOLD = 7

export type ChampionshipProgress = {
  playerId: string
  playerName: string
  playerPhotoUrl?: string
  streak: number
  isChampion: boolean
} | null

export function pickChampionshipProgress(players: Player[], matches: Match[]): ChampionshipProgress {
  const streaks = calculateAllCurrentStreaks(matches)
  let best: { player: Player; streak: number } | null = null

  for (const p of players) {
    const s = streaks[p.id]
    if (s?.kind !== 'win' || s.count <= 0) continue
    if (!best || s.count > best.streak || (s.count === best.streak && p.name.localeCompare(best.player.name) < 0)) {
      best = { player: p, streak: s.count }
    }
  }

  if (!best) return null
  return {
    playerId: best.player.id,
    playerName: best.player.name,
    playerPhotoUrl: best.player.photoUrl,
    streak: best.streak,
    isChampion: best.streak >= CHAMPIONSHIP_THRESHOLD,
  }
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

  const winners = useMemo(
    () => pickAwardWinners(computePlayerStatRows(players, yearMatches)),
    [players, yearMatches],
  )

  // Deliberately NOT scoped to yearMatches/selectedYear: this reflects the live,
  // right-now streak state, independent of whatever season the awards grid below
  // is browsing — switching "Temporada" must not change it.
  const championship = useMemo(
    () => pickChampionshipProgress(players, matches),
    [players, matches],
  )

  return {
    currentYear: selectedYear,
    availableYears,
    onSelectYear: setSelectedYear,
    winners,
    championship,
  }
}
