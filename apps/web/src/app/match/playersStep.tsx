'use client'

import type { ReactNode } from 'react'
import type { MatchType } from '@fulbito/types'
import { MATCH_TYPES, type Convocatoria } from '@fulbito/utils'
import type { Player } from '@/store/usePlayerStore'
import { MatchTypeSelect } from './matchTypeSelect'
import ListOfPlayers from './listOfPlayers'
import TeamGenerationBar from './teamGenerationBar'
import ConvocatoriaSelect from './convocatoriaSelect'
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
  convocatoria: Convocatoria
  onConvocatoriaChange: ((convocatoria: Convocatoria) => void) | null
  lockMatchType: boolean
  openMatchForm: ReactNode
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
  convocatoria,
  onConvocatoriaChange,
  lockMatchType,
  openMatchForm,
}: Props) {
  return (
    <>
      <MatchTypeSelect value={matchType} options={MATCH_TYPES} onChange={onMatchTypeChange} disabled={lockMatchType}>
        {onConvocatoriaChange && <ConvocatoriaSelect value={convocatoria} onChange={onConvocatoriaChange} />}
      </MatchTypeSelect>

      {convocatoria === 'open' && matchType && openMatchForm}

      {convocatoria === 'preselected' && matchType && (
        <ListOfPlayers players={players} requiredPlayers={requiredPlayers} isFriendly={isFriendly} {...selection} />
      )}

      {convocatoria === 'preselected' && isSelectionComplete && (
        <TeamGenerationBar onManual={onManual} onAuto={onAuto} />
      )}
    </>
  )
}
