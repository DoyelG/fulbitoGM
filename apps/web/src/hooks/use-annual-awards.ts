'use client'

import type { Match, Player } from '@fulbito/types'
import {
  CHAMPIONSHIP_THRESHOLD,
  calculateAllCurrentStreaks,
  computeSeasonStatRows,
  pickAwardPodiums,
  pickSeasonChampions,
  type SeasonChampion,
} from '@fulbito/utils'
import { useMemo, useState } from 'react'

export const HALL_OF_FAME = 'hall-of-fame'
export type SeasonSelection = number | typeof HALL_OF_FAME

export type ChampionshipProgress = {
  playerId: string
  playerName: string
  playerPhotoUrl?: string
  streak: number
  isChampion: boolean
} | null

export type HallOfFameEntry = { year: number; champions: SeasonChampion[] }

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
  const [selection, setSelection] = useState<SeasonSelection>(() => new Date().getFullYear())
  const isHallOfFame = selection === HALL_OF_FAME

  const availableYears = useMemo(() => {
    const years = new Set(matches.map((m) => new Date(m.date).getFullYear()))
    years.add(new Date().getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [matches])

  // Streak-based awards need every match, not just the season's: a run that
  // starts in one year and is decided in the next belongs to the deciding year.
  const podiums = useMemo(
    () => (isHallOfFame ? [] : pickAwardPodiums(computeSeasonStatRows(players, matches, selection as number))),
    [players, matches, selection, isHallOfFame],
  )

  const seasonChampions = useMemo(
    () => (isHallOfFame ? [] : pickSeasonChampions(players, matches, selection as number)),
    [players, matches, selection, isHallOfFame],
  )

  const hallOfFame = useMemo<HallOfFameEntry[]>(
    () =>
      availableYears
        .map((year) => ({ year, champions: pickSeasonChampions(players, matches, year) }))
        .filter((entry) => entry.champions.length > 0),
    [availableYears, players, matches],
  )

  // Deliberately NOT scoped to yearMatches/selection: this reflects the live,
  // right-now streak state, independent of whatever season the page is browsing.
  const championship = useMemo(() => pickChampionshipProgress(players, matches), [players, matches])

  return {
    selection,
    isHallOfFame,
    availableYears,
    onSelectSeason: setSelection,
    podiums,
    seasonChampions,
    hallOfFame,
    championship,
  }
}
