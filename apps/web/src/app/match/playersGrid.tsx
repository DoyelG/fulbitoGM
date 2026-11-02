'use client'

import type { Player } from '@/store/usePlayerStore'
import { Card } from '@/components/Card'
import { MAX_GOALKEEPERS } from '@fulbito/utils'
import PlayerRow from './playerRow'

type Props = {
  players: Player[]
  selected: Set<string>
  goalkeeperIds: Set<string>
  toggleSelect: (playerId: string) => void
  toggleGoalkeeper: (playerId: string) => void
}

export default function PlayersGrid({ players, selected, goalkeeperIds, toggleSelect, toggleGoalkeeper }: Props) {
  return (
    <Card padding={6} className="grid grid-cols-1 gap-3 pt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {players.map((player) => {
        const isGoalkeeper = goalkeeperIds.has(player.id)

        return (
          <PlayerRow
            key={player.id}
            player={player}
            isSelected={selected.has(player.id)}
            isGoalkeeper={isGoalkeeper}
            isGoalkeeperDisabled={!isGoalkeeper && goalkeeperIds.size >= MAX_GOALKEEPERS}
            onToggleSelect={() => toggleSelect(player.id)}
            onToggleGoalkeeper={() => toggleGoalkeeper(player.id)}
          />
        )
      })}
    </Card>
  )
}
