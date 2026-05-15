import type { Match, Player } from '@fulbito/types'
import { useMemo, useState } from 'react'

export type PoolState = {
  poolIds: Set<string>
  poolPlayers: Player[]
  setPoolIds: (ids: Set<string>) => void
}

export function usePool(players: Player[], initial?: Match): PoolState {
  const [poolIds, setPoolIds] = useState<Set<string>>(() => {
    if (initial) {
      return new Set(
        [...(initial.teamA ?? []), ...(initial.teamB ?? [])].map((p) => p.id),
      )
    }
    return new Set()
  })

  const poolPlayers = useMemo(
    () => players.filter((p) => poolIds.has(p.id)),
    [players, poolIds],
  )

  return { poolIds, poolPlayers, setPoolIds }
}
