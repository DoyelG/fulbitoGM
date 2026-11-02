'use client'

import { Card } from '@/components/Card'
import Button from '@/components/Button'
import { MAX_GOALKEEPERS } from '@fulbito/utils'
import { FiTrash2 } from 'react-icons/fi'

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
  extra: 'bg-red-100 text-red-800',
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
    <Card className="sticky top-26 z-10">
      <h3 className="mb-4 text-xl font-semibold">Seleccionar jugadores</h3>
      <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-gray-800">
        <span>
          Seleccionados: <span className="font-semibold">{selectedCount}</span> / {requiredPlayers}
        </span>
        <span className={`rounded px-2 py-0.5 ${playersStyle}`}>{playersLabel}</span>
        <span className={`rounded px-2 py-0.5 ${goalkeeperStyle}`}>
          🧤 Arqueros: {goalkeeperCount} / {MAX_GOALKEEPERS}
        </span>
        {isFriendly && <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">Amistoso</span>}
        <Button variant="softDanger" size="sm" className="ml-auto" onClick={onReset} disabled={selectedCount === 0}>
          <FiTrash2 size={16} aria-hidden="true" />
          Limpiar selección
        </Button>
      </div>
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        aria-label="Buscar jugadores por nombre"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-1 focus-visible:outline-brand"
        placeholder="Buscar jugadores por nombre..."
      />
    </Card>
  )
}
