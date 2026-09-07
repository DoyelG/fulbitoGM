import type { Match, Player } from '@fulbito/types'
import {
  computeSeasonStatRows,
  listAvailableSeasons,
  pickAwardPodiums,
  pickChampionshipProgress,
  pickHallOfFame,
  pickSeasonChampions,
  type AwardAccent,
  type AwardPodium,
} from '@fulbito/utils'
import { useMemo, useState } from 'react'

export type { AwardAccent, AwardPodium }
export type { ChampionshipProgress, HallOfFameEntry, SeasonChampion } from '@fulbito/utils'

export const HALL_OF_FAME = 'hall-of-fame'
export type SeasonSelection = number | typeof HALL_OF_FAME

export type AwardIcon =
  | { lib: 'ionicons'; name: 'star' }
  | { lib: 'mci'; name: 'run' | 'emoticon-sad-outline' | 'washing-machine' | 'soccer' | 'trophy-broken' }

export function useAnnualAwards(players: Player[], matches: Match[]) {
  const [selection, setSelection] = useState<SeasonSelection>(() => new Date().getFullYear())
  const isHallOfFame = selection === HALL_OF_FAME

  const availableYears = useMemo(() => listAvailableSeasons(matches), [matches])

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

  const hallOfFame = useMemo(() => pickHallOfFame(players, matches, availableYears), [availableYears, players, matches])

  // Deliberately NOT scoped to the selection: this reflects the live, right-now
  // streak state, independent of whatever season the screen is browsing.
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
