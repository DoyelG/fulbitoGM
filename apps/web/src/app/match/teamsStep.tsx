'use client'

import type { DragEvent } from 'react'
import { PiStarFourFill } from 'react-icons/pi'
import type { PlayerInfo } from '@/lib/teamUtils'
import { Card } from '@/components/Card'
import Button from '@/components/Button'
import { DropColumn, DraggableItem, type DropTarget } from '@/components/DragAndDrop'

type Props = {
  unassigned: PlayerInfo[]
  teamA: PlayerInfo[]
  teamB: PlayerInfo[]
  playersPerTeam: number
  goalkeeperIds: Set<string>
  onMove: (player: PlayerInfo, target: DropTarget) => void
  onReset: () => void
  onContinue: () => void
}

export default function TeamsStep({
  unassigned,
  teamA,
  teamB,
  playersPerTeam,
  goalkeeperIds,
  onMove,
  onReset,
  onContinue,
}: Props) {
  const allAssigned = unassigned.length === 0

  const columns: { target: DropTarget; title: string; subtitle?: string; players: PlayerInfo[] }[] = [
    { target: 'unassigned', title: 'Sin asignar', subtitle: 'Se completan solos al generar', players: unassigned },
    { target: 'a', title: `Equipo A`, players: teamA },
    { target: 'b', title: `Equipo B`, players: teamB },
  ]

  const handleDrop = (event: DragEvent<HTMLDivElement>, target: DropTarget) => {
    const json = event.dataTransfer.getData('application/json')
    if (!json) return
    const droppedPlayer: PlayerInfo = JSON.parse(json)
    onMove(droppedPlayer, target)
  }

  return (
    <Card className="mt-6">
      <h3 className="text-xl font-semibold">Configuración manual</h3>
      <p className="mb-6 text-gray-500 text-sm">
        <strong>Arrastre</strong> jugadores para asignarlos a equipos. Los jugadores no asignados se completarán
        automáticamente al generar equipos.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map(({ target, title, subtitle, players }) => (
          <DropColumn
            key={target}
            title={title}
            subtitle={subtitle}
            onDrop={(event) => handleDrop(event, target)}
            target={target}
            playersCount={players.length}
            limit={playersPerTeam}
          >
            {players.map((player) => (
              <DraggableItem
                key={player.id}
                data={player}
                label={player.name}
                isGoalkeeper={goalkeeperIds.has(player.id)}
              />
            ))}
          </DropColumn>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onReset}>
            Reiniciar
          </Button>
        </div>
        <Button variant={allAssigned ? 'primary' : 'tertiary'} onClick={onContinue}>
          {!allAssigned && <PiStarFourFill size={14} aria-hidden="true" />}
          {allAssigned ? 'Confirmar equipos' : 'Completar el resto'}
        </Button>
      </div>
    </Card>
  )
}
