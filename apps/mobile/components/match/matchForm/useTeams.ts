import type { Match } from '@fulbito/types'
import { useState } from 'react'

import type { RecordingPlayer, TeamSide } from './types'

export type TeamsState = {
  teamA: RecordingPlayer[]
  teamB: RecordingPlayer[]
  pinnedA: Set<string>
  pinnedB: Set<string>
  setTeamA: (players: RecordingPlayer[]) => void
  setTeamB: (players: RecordingPlayer[]) => void
  confirmTeam: (side: TeamSide, players: RecordingPlayer[]) => void
  removeFromTeam: (side: TeamSide, id: string) => void
  filterByPool: (poolIds: Set<string>) => void
  reset: () => void
}

export function useTeams(initial?: Match): TeamsState {
  const [teamA, setTeamA] = useState<RecordingPlayer[]>(
    initial?.teamA?.map((p) => ({ id: p.id, name: p.name })) ?? [],
  )
  const [teamB, setTeamB] = useState<RecordingPlayer[]>(
    initial?.teamB?.map((p) => ({ id: p.id, name: p.name })) ?? [],
  )
  const [pinnedA, setPinnedA] = useState<Set<string>>(new Set())
  const [pinnedB, setPinnedB] = useState<Set<string>>(new Set())

  const confirmTeam = (side: TeamSide, selected: RecordingPlayer[]) => {
    const ids = new Set(selected.map((p) => p.id))
    if (side === 'a') {
      setTeamA(selected)
      setPinnedA(ids)
    } else {
      setTeamB(selected)
      setPinnedB(ids)
    }
  }

  const removeFromTeam = (side: TeamSide, id: string) => {
    const removeId = (s: Set<string>) => {
      const next = new Set(s)
      next.delete(id)
      return next
    }
    if (side === 'a') {
      setTeamA((prev) => prev.filter((p) => p.id !== id))
      setPinnedA(removeId)
    } else {
      setTeamB((prev) => prev.filter((p) => p.id !== id))
      setPinnedB(removeId)
    }
  }

  const filterByPool = (poolIds: Set<string>) => {
    setTeamA((prev) => prev.filter((p) => poolIds.has(p.id)))
    setTeamB((prev) => prev.filter((p) => poolIds.has(p.id)))
  }

  const reset = () => {
    setTeamA([])
    setTeamB([])
    setPinnedA(new Set())
    setPinnedB(new Set())
  }

  return {
    teamA,
    teamB,
    pinnedA,
    pinnedB,
    setTeamA,
    setTeamB,
    confirmTeam,
    removeFromTeam,
    filterByPool,
    reset,
  }
}
