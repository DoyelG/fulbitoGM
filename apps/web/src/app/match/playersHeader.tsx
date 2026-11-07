'use client'

import { Card } from '@/components/Card'
import Button from '@/components/Button'
import { MAX_GOALKEEPERS } from '@fulbito/utils'
import { FiTrash2 } from 'react-icons/fi'
import { fieldClassName } from '@/lib/field-styles'

type Props = {
  selectedCount: number
  requiredPlayers: number
  goalkeeperCount: number
  isFriendly: boolean
  query: string
  onQueryChange: (query: string) => void
  onReset: () => void
}

const PLAYERS_STYLES = {
  complete: 'bg-green-100 text-green-800',
  missing: 'bg-yellow-100 text-yellow-800',
  extra: 'bg-orange-100 text-orange-800',
}

function getPlayersStatus(difference: number): keyof typeof PLAYERS_STYLES {
  if (difference === 0) return 'complete'
  return difference > 0 ? 'missing' : 'extra'
}

const GOALKEEPER_STYLES = {
  missing: 'bg-purple-100 text-purple-800',
  complete: 'bg-green-100 text-green-800',
}

export default function PlayersHeader({
  selectedCount,
  requiredPlayers,
  goalkeeperCount,
  isFriendly,
  query,
  onQueryChange,
  onReset,
}: Props) {
  const difference = requiredPlayers - selectedCount
  const amount = Math.abs(difference)
  const isSingular = amount === 1

  const missingText = isSingular ? 'Falta' : 'Faltan'
  const extraText = isSingular ? 'Sobra' : 'Sobran'

  const playersStatus = getPlayersStatus(difference)
  const playersStyle = PLAYERS_STYLES[playersStatus]
  const statusText = playersStatus === 'missing' ? missingText : extraText
  const playersLabel = playersStatus === 'complete' ? 'Completo' : `${statusText} ${amount}`

  const hasAllGoalkeepers = goalkeeperCount >= MAX_GOALKEEPERS
  const goalkeeperStyle = hasAllGoalkeepers ? GOALKEEPER_STYLES.complete : GOALKEEPER_STYLES.missing

  return (
    <div className="sticky top-18 z-10 bg-gray-50 pt-2 sm:top-22 sm:pt-4">
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold">Seleccionar jugadores</h3>
          <Button
            variant="softDanger"
            size="sm"
            className="shrink-0"
            onClick={onReset}
            disabled={selectedCount === 0}
            aria-label="Limpiar selección"
          >
            <FiTrash2 size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Limpiar selección</span>
          </Button>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-800 sm:gap-3">
          <span>
            Seleccionados: <span className="font-semibold">{selectedCount}</span> / {requiredPlayers}
          </span>
          <span className={`rounded px-2 py-0.5 ${playersStyle}`}>{playersLabel}</span>
          <span className={`rounded px-2 py-0.5 ${goalkeeperStyle}`}>
            🧤 <span className="sr-only sm:not-sr-only">Arqueros:</span> {goalkeeperCount} / {MAX_GOALKEEPERS}
          </span>
          {isFriendly && <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">Amistoso</span>}
        </div>
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label="Buscar jugadores por nombre"
          className={`${fieldClassName} text-sm`}
          placeholder="Buscar jugadores por nombre..."
        />
      </Card>
    </div>
  )
}
