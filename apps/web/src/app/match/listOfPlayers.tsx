'use client'

import { useMemo, useState } from 'react'
import type { Player } from '@/store/usePlayerStore'
import PlayersHeader from './playersHeader'
import PlayersGrid from '@/components/PlayersGrid'

type Props = {
  players: Player[]
  selected: Set<string>
  goalkeeperIds: Set<string>
  requiredPlayers: number
  isFriendly: boolean
  toggleSelect: (playerId: string) => void
  toggleGoalkeeper: (playerId: string) => void
  reset: () => void
}

export default function ListOfPlayers({
  players,
  selected,
  goalkeeperIds,
  requiredPlayers,
  isFriendly,
  toggleSelect,
  toggleGoalkeeper,
  reset,
}: Props) {
  const [playerQuery, setPlayerQuery] = useState('')

  const availablePlayers = useMemo(() => players.filter((player) => !player.inactive), [players])

  const visiblePlayers = useMemo(() => {
    const normalizedQuery = playerQuery.trim().toLowerCase()
    return availablePlayers.filter((player) => player.name.toLowerCase().includes(normalizedQuery))
  }, [availablePlayers, playerQuery])

  return (
    <section className="relative z-2 my-6 motion-safe:transition-all motion-safe:duration-900 motion-safe:ease-in-out starting:-translate-y-24">
      <PlayersHeader
        selectedCount={selected.size}
        requiredPlayers={requiredPlayers}
        goalkeeperCount={goalkeeperIds.size}
        isFriendly={isFriendly}
        query={playerQuery}
        onQueryChange={setPlayerQuery}
        onReset={reset}
      />
      <PlayersGrid
        visiblePlayers={visiblePlayers}
        availablePlayers={availablePlayers}
        selected={selected}
        goalkeeperIds={goalkeeperIds}
        toggleSelect={toggleSelect}
        toggleGoalkeeper={toggleGoalkeeper}
      />
    </section>
  )
}
