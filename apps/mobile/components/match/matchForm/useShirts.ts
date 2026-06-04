import type { Match } from '@fulbito/types'
import {
  buildPlayedBeforeSet,
  computeLeastAssignedPoolIds,
  getEligiblePlayerIds,
  getShirtDutiesByPlayerId,
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
  /** Conteo derivado de cuántas veces cada jugador se llevó las camisetas */
  dutiesById: Map<string, number>
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
  const dutiesById = useMemo(() => getShirtDutiesByPlayerId(allMatches), [allMatches])

  const { teamPlayers, dutyPoolIds } = useMemo(() => {
    const all = [...teamA, ...teamB]
    const teamIds = all.map((p) => p.id)
    const eligibleIds = getEligiblePlayerIds(teamIds, playedBefore)
    const { poolIds } = computeLeastAssignedPoolIds(eligibleIds, dutiesById)
    return { teamPlayers: all, dutyPoolIds: poolIds }
  }, [teamA, teamB, dutiesById, playedBefore])

  return {
    shirtsResponsibleId,
    setShirtsResponsibleId,
    playedBefore,
    teamPlayers,
    dutyPoolIds,
    dutiesById,
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
