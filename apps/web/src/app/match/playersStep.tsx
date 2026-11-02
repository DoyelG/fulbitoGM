'use client'

import type { MatchType } from '@fulbito/types'
import { MATCH_TYPES } from '@fulbito/utils'
import type { Player } from '@/store/usePlayerStore'
import { MatchTypeSelect } from './matchTypeSelect'
import ListOfPlayers from './listOfPlayers'
import TeamGenerationBar from './teamGenerationBar'
import type { PlayerSelection } from './use-player-selection'

type Props = {
  players: Player[]
  matchType: MatchType | null
  onMatchTypeChange: (matchType: MatchType | null) => void
  requiredPlayers: number
  isFriendly: boolean
  selection: PlayerSelection
  isSelectionComplete: boolean
  onManual: () => void
  onAuto: () => void
}

export default function PlayersStep({
  players,
  matchType,
  onMatchTypeChange,
  requiredPlayers,
  isFriendly,
  selection,
  isSelectionComplete,
  onManual,
  onAuto,
}: Props) {
  return (
    <>
      <MatchTypeSelect value={matchType} options={MATCH_TYPES} onChange={onMatchTypeChange} />

      {matchType && (
        <ListOfPlayers players={players} requiredPlayers={requiredPlayers} isFriendly={isFriendly} {...selection} />
      )}

      {isSelectionComplete && <TeamGenerationBar onManual={onManual} onAuto={onAuto} />}
    </>
  )
}
