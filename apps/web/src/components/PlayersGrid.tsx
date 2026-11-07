'use client'

import { useId, type ReactNode } from 'react'
import type { Player } from '@/store/usePlayerStore'
import { Card } from '@/components/Card'
import EmptyState from '@/components/EmptyState'
import { MAX_GOALKEEPERS } from '@fulbito/utils'
import { FiSearch, FiUsers } from 'react-icons/fi'
import PlayerRow from './PlayerRow'

type Props = {
  visiblePlayers: Player[]
  availablePlayers: Player[]
  selected: Set<string>
  goalkeeperIds?: Set<string>
  toggleSelect: (playerId: string) => void
  toggleGoalkeeper?: (playerId: string) => void
  isMultiSelector?: boolean
  columnsClassName?: string
  embedded?: boolean
  maxHeight?: number | string
}

const DEFAULT_COLUMNS = 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

const NO_PLAYERS = {
  icon: FiUsers,
  title: 'No hay jugadores disponibles para seleccionar',
}

const NO_RESULTS = {
  icon: FiSearch,
  title: 'No se encontraron jugadores',
  description: 'Probá con otro nombre.',
}

type ContainerProps = { embedded: boolean; children: ReactNode }

function Container({ embedded, children }: ContainerProps) {
  if (embedded) return <div>{children}</div>
  return (
    <Card padding={6} className="pt-8">
      {children}
    </Card>
  )
}

export default function PlayersGrid({
  visiblePlayers,
  availablePlayers,
  selected,
  goalkeeperIds,
  toggleSelect,
  toggleGoalkeeper,
  isMultiSelector = true,
  columnsClassName = DEFAULT_COLUMNS,
  embedded = false,
  maxHeight,
}: Props) {
  const groupName = useId()

  if (availablePlayers.length === 0) {
    return (
      <Container embedded={embedded}>
        <EmptyState {...NO_PLAYERS} />
      </Container>
    )
  }

  if (visiblePlayers.length === 0) {
    return (
      <Container embedded={embedded}>
        <EmptyState {...NO_RESULTS} />
      </Container>
    )
  }

  return (
    <Container embedded={embedded}>
      <div
        role={isMultiSelector ? undefined : 'radiogroup'}
        aria-label={isMultiSelector ? undefined : 'Jugadores disponibles'}
        className={`grid grid-cols-1 gap-3 ${columnsClassName} ${maxHeight === undefined ? '' : 'scrollbar-visible overflow-y-auto pr-2'}`}
        style={maxHeight === undefined ? undefined : { maxHeight }}
      >
        {visiblePlayers.map((player) => {
          const isGoalkeeper = goalkeeperIds?.has(player.id) ?? false

          return (
            <PlayerRow
              key={player.id}
              player={player}
              isSelected={selected.has(player.id)}
              isGoalkeeper={isGoalkeeper}
              isGoalkeeperDisabled={!isGoalkeeper && (goalkeeperIds?.size ?? 0) >= MAX_GOALKEEPERS}
              onToggleSelect={() => toggleSelect(player.id)}
              onToggleGoalkeeper={toggleGoalkeeper && (() => toggleGoalkeeper(player.id))}
              isMultiSelector={isMultiSelector}
              groupName={groupName}
            />
          )
        })}
      </div>
    </Container>
  )
}
