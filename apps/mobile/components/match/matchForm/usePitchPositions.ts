import type { Match, PitchPosition } from '@fulbito/types'
import { hasPitchPosition, type PitchSide } from '@fulbito/utils'
import { useState } from 'react'

import type { RecordingPlayer } from './types'

type SidedPosition = PitchPosition & { side: PitchSide }

export type PitchPositionsState = {
  positionsFor: (teamA: RecordingPlayer[], teamB: RecordingPlayer[]) => Record<string, PitchPosition>
  move: (playerId: string, side: PitchSide, position: PitchPosition) => void
}

function savedPositions(initial?: Match): Record<string, SidedPosition> {
  if (!initial) return {}
  const sided = (team: Match['teamA'], side: PitchSide) =>
    team.flatMap((player) =>
      hasPitchPosition(player) ? [[player.id, { x: player.x, y: player.y, side }] as const] : [],
    )
  return Object.fromEntries([...sided(initial.teamA, 'A'), ...sided(initial.teamB, 'B')])
}

export function usePitchPositions(initial?: Match): PitchPositionsState {
  const [positions, setPositions] = useState<Record<string, SidedPosition>>(() => savedPositions(initial))

  const positionsFor = (teamA: RecordingPlayer[], teamB: RecordingPlayer[]) => {
    const onSide = (team: RecordingPlayer[], side: PitchSide) =>
      team.flatMap((player) => {
        const saved = positions[player.id]
        return saved?.side === side ? [[player.id, { x: saved.x, y: saved.y }] as const] : []
      })
    return Object.fromEntries([...onSide(teamA, 'A'), ...onSide(teamB, 'B')])
  }

  const move = (playerId: string, side: PitchSide, position: PitchPosition) =>
    setPositions((previous) => ({ ...previous, [playerId]: { ...position, side } }))

  return { positionsFor, move }
}
