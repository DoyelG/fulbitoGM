'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Match, PitchPosition } from '@fulbito/types'
import { hasPitchChanges, resolveTeamPositions, withPitchPositions } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'

export type PitchSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const SAVED_VISIBLE_MS = 3000

export function usePitchEdits(match: Match) {
  const updateMatchPositions = useMatchStore((state) => state.updateMatchPositions)
  const players = usePlayerStore((state) => state.players)
  const roleById = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.position])), [players])
  const [edits, setEdits] = useState<Record<string, PitchPosition>>({})
  const [status, setStatus] = useState<PitchSaveStatus>('idle')
  const [showsTick, setShowsTick] = useState(false)
  const goalkeeperIds = match.goalkeeperIds ?? []
  const teamA = withPitchPositions(match.teamA, edits)
  const teamB = withPitchPositions(match.teamB, edits)
  const originalPositions = {
    ...resolveTeamPositions(match.teamA, goalkeeperIds, 'A', roleById),
    ...resolveTeamPositions(match.teamB, goalkeeperIds, 'B', roleById),
  }
  const isDirty = hasPitchChanges(originalPositions, edits)

  useEffect(() => {
    if (status !== 'saved') return
    const timer = setTimeout(() => setStatus('idle'), SAVED_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [status])

  const move = (playerId: string, position: PitchPosition) => {
    setEdits((previous) => ({ ...previous, [playerId]: position }))
    setStatus('idle')
    setShowsTick(false)
  }

  const save = async (): Promise<boolean> => {
    if (status === 'saving') return false
    setStatus('saving')
    try {
      await updateMatchPositions(match.id, {
        ...resolveTeamPositions(teamA, goalkeeperIds, 'A', roleById),
        ...resolveTeamPositions(teamB, goalkeeperIds, 'B', roleById),
      })
      setEdits({})
      setStatus('saved')
      setShowsTick(true)
      return true
    } catch {
      setStatus('error')
      return false
    }
  }

  const discard = () => {
    setEdits({})
    setStatus('idle')
  }

  return { teamA, teamB, goalkeeperIds, isDirty, status, showsTick, move, save, discard }
}
