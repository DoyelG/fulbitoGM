import type { Match, Player } from '@fulbito/types'
import {
  buildPlayedBeforeSet,
  computeLeastAssignedPoolIds,
  getEligiblePlayerIds,
} from '@fulbito/utils'
import { useMemo, useState } from 'react'

import type { RecordingPlayer } from './types'

export type ShirtsState = {
  shirtsResponsibleId: string | null
  setShirtsResponsibleId: (id: string | null) => void
  playedBefore: Set<string>
  /** Jugadores en cancha (combinación de ambos equipos) */
  teamPlayers: RecordingPlayer[]
  /** IDs candidatos para asignación automática */
  dutyPoolIds: string[]
}

export function useShirts(
  allMatches: Match[],
  teamA: RecordingPlayer[],
  teamB: RecordingPlayer[],
  initial?: Match,
): ShirtsState {
  const [shirtsResponsibleId, setShirtsResponsibleId] = useState<string | null>(
    initial?.shirtsResponsibleId ?? null,
  )

  const playedBefore = useMemo(() => buildPlayedBeforeSet(allMatches), [allMatches])

  const { teamPlayers, dutyPoolIds } = useMemo(() => {
    const all = [...teamA, ...teamB]
    const teamIds = all.map((p) => p.id)
    const eligibleIds = getEligiblePlayerIds(teamIds, playedBefore)
    const { poolIds } = computeLeastAssignedPoolIds(eligibleIds, players)
    return { teamPlayers: all, dutyPoolIds: poolIds }
  }, [teamA, teamB, players, playedBefore])

  return {
    shirtsResponsibleId,
    setShirtsResponsibleId,
    playedBefore,
    teamPlayers,
    dutyPoolIds,
  }
}

export function pickShirtsResponsible(
  manualId: string | null,
  dutyPoolIds: string[],
): string | null {
  if (manualId) return manualId
  if (dutyPoolIds.length === 0) return null
  return dutyPoolIds[Math.floor(Math.random() * dutyPoolIds.length)]
}
