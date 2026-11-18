'use client'

import { useState } from 'react'
import type { MatchFilters, MatchKindFilter } from '@fulbito/utils'
import { XMarkIcon } from '@heroicons/react/20/solid'
import Button from '@/components/Button'
import MatchTypeFilter from './MatchTypeFilter'
import FilterSelect, { type FilterOption } from './FilterSelect'
import FiltersToggleButton from './FiltersToggleButton'

export type PlayerStatusFilter = 'all' | 'active' | 'inactive'

type Props = {
  filters: MatchFilters
  onFiltersChange: (filters: MatchFilters) => void
  playerStatus: PlayerStatusFilter
  onPlayerStatusChange: (status: PlayerStatusFilter) => void
  years: number[]
  matchCount: number
  playerCount: number
  onClear: () => void
}

const KIND_OPTIONS: FilterOption<MatchKindFilter>[] = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'competitive', label: 'Competitivos' },
  { value: 'friendly', label: 'Amistosos' },
]

const PLAYER_STATUS_OPTIONS: FilterOption<PlayerStatusFilter>[] = [
  { value: 'active', label: 'Solo activos' },
  { value: 'inactive', label: 'Solo inactivos' },
  { value: 'all', label: 'Todos los jugadores' },
]

export default function StatisticsToolbar({
  filters,
  onFiltersChange,
  playerStatus,
  onPlayerStatusChange,
  years,
  matchCount,
  playerCount,
  onClear,
}: Props) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const toggleFilters = () => {
    if (open) setExpanded(false)
    setOpen(!open)
  }

  const activeCount = [
    filters.types.length > 0,
    filters.kind !== 'all',
    filters.year !== 'all',
    playerStatus !== 'active',
  ].filter(Boolean).length

  const yearOptions: FilterOption<string>[] = [
    { value: 'all', label: 'Todos los años' },
    ...years.map((year) => ({ value: String(year), label: String(year) })),
  ]

  return (
    <div className="border-b border-gray-200 z-20 relative">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <FiltersToggleButton
            open={open}
            activeCount={activeCount}
            controlsId="statistics-filters"
            onClick={toggleFilters}
          />
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <XMarkIcon className="size-4" aria-hidden="true" />
              Limpiar
            </Button>
          )}
        </div>
        <p aria-live="polite" className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{matchCount}</span> {matchCount === 1 ? 'partido' : 'partidos'}{' '}
          · <span className="font-semibold text-gray-900">{playerCount}</span>{' '}
          {playerCount === 1 ? 'jugador' : 'jugadores'}
        </p>
      </div>

      <div
        id="statistics-filters"
        inert={!open}
        onTransitionEnd={() => setExpanded(open)}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className={expanded ? 'overflow-visible' : 'overflow-hidden'}>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4 border-t border-gray-100 bg-gray-50/60 px-4 py-4">
            <MatchTypeFilter value={filters.types} onChange={(types) => onFiltersChange({ ...filters, types })} />
            <FilterSelect
              id="match-kind-filter"
              label="Tipo de partido"
              value={filters.kind}
              options={KIND_OPTIONS}
              onChange={(kind) => onFiltersChange({ ...filters, kind })}
            />
            <FilterSelect
              id="match-year-filter"
              label="Año"
              value={String(filters.year)}
              options={yearOptions}
              onChange={(year) => onFiltersChange({ ...filters, year: year === 'all' ? 'all' : Number(year) })}
            />
            <FilterSelect
              id="player-status-filter"
              label="Estado del jugador"
              value={playerStatus}
              options={PLAYER_STATUS_OPTIONS}
              onChange={onPlayerStatusChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
