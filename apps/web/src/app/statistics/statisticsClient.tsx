'use client'

import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import {
  DEFAULT_MATCH_FILTERS,
  computePlayerStatRows,
  filterMatches,
  getMatchYears,
  normalizeForSearch,
  onlyFinalMatches,
  type MatchFilters,
} from '@fulbito/utils'
import type { Match, Player } from '@fulbito/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SearchInput from '@/components/SearchInput'
import StatisticsTable, { type StatRow, type StatSortKey, type SortDir } from './StatisticsTable'
import { Card } from '@/components/Card'
import PageTitle from '@/components/PageTitle'
import StatisticsSkeleton from './StatisticsSkeleton'
import StatisticsToolbar, { type PlayerStatusFilter } from './StatisticsToolbar'

export default function StatisticsClient({
  players: propsPlayers,
  matches: propsMatches,
}: {
  players: Player[]
  matches: Match[]
}) {
  const { hydrateMatches, matches, matchesInit, resetAndReload: resetMatches } = useMatchStore()
  const { hydratePlayers, players: storePlayers, playersInit, resetAndReload: resetPlayers } = usePlayerStore()

  const initialized = useRef(false)
  const [isLoading, setIsLoading] = useState(() => matchesInit !== 'loaded' || playersInit !== 'loaded')

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (propsMatches.length > 0) hydrateMatches(propsMatches)
    if (propsPlayers.length > 0) hydratePlayers(propsPlayers)
    Promise.all([resetMatches(), resetPlayers()]).finally(() => setIsLoading(false))
  }, [hydrateMatches, propsMatches, hydratePlayers, propsPlayers, resetMatches, resetPlayers])

  const [filters, setFilters] = useState<MatchFilters>(DEFAULT_MATCH_FILTERS)

  const availableYears = useMemo(() => getMatchYears(onlyFinalMatches(matches)), [matches])

  const filteredMatches = useMemo(() => filterMatches(onlyFinalMatches(matches), filters), [matches, filters])

  const stats = useMemo<StatRow[]>(
    () => computePlayerStatRows(storePlayers, filteredMatches),
    [storePlayers, filteredMatches],
  )

  const [sortKey, setSortKey] = useState<StatSortKey>('goals')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = useCallback(
    (key: StatSortKey) => {
      if (sortKey === key) {
        setSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDir('desc')
      }
    },
    [sortKey],
  )

  const sorted = useMemo(() => {
    const getValue = (row: StatRow, key: StatSortKey) => {
      if (key === 'goalsPerMatch') return row.matches === 0 ? 0 : row.goals / row.matches
      if (key === 'winRate') return row.matches === 0 ? 0 : row.wins / row.matches
      return row[key]
    }
    const dir = sortDir === 'asc' ? 1 : -1
    return [...stats].sort((firstRow, secondRow) => {
      const firstValue = getValue(firstRow, sortKey)
      const secondValue = getValue(secondRow, sortKey)
      if (typeof firstValue === 'string' && typeof secondValue === 'string')
        return firstValue.localeCompare(secondValue) * dir
      const firstNumber = Number(firstValue)
      const secondNumber = Number(secondValue)
      if (Number.isNaN(firstNumber) || Number.isNaN(secondNumber)) return 0
      if (firstNumber === secondNumber) return 0
      return firstNumber > secondNumber ? dir : -dir
    })
  }, [stats, sortKey, sortDir])

  const inactiveIds = useMemo(
    () => new Set(storePlayers.filter((player) => player.inactive).map((player) => player.id)),
    [storePlayers],
  )

  const photoUrlById = useMemo(
    () => new Map(storePlayers.flatMap((player) => (player.photoUrl ? [[player.id, player.photoUrl] as const] : []))),
    [storePlayers],
  )

  const activeStats = useMemo(() => sorted.filter((stat) => !inactiveIds.has(stat.id)), [sorted, inactiveIds])

  const inactiveStats = useMemo(() => sorted.filter((stat) => inactiveIds.has(stat.id)), [sorted, inactiveIds])

  const [playerStatusFilter, setPlayerStatusFilter] = useState<PlayerStatusFilter>('active')

  const [searchQuery, setSearchQuery] = useState('')

  const statusFiltered =
    playerStatusFilter === 'all' ? sorted : playerStatusFilter === 'active' ? activeStats : inactiveStats

  const normalizedQuery = normalizeForSearch(searchQuery.trim())
  const filteredPlayers = normalizedQuery
    ? statusFiltered.filter((stat) => normalizeForSearch(stat.name).includes(normalizedQuery))
    : statusFiltered

  const hasMatchFilters = filters.types.length > 0 || filters.kind !== 'all' || filters.year !== 'all'
  const hasActiveFilters = hasMatchFilters || playerStatusFilter !== 'active' || normalizedQuery !== ''

  const clearFilters = () => {
    setFilters(DEFAULT_MATCH_FILTERS)
    setPlayerStatusFilter('active')
    setSearchQuery('')
  }

  const emptyMessage =
    stats.length === 0
      ? hasMatchFilters
        ? 'No hay partidos que coincidan con los filtros.'
        : 'No hay estadísticas disponibles.'
      : normalizedQuery && statusFiltered.length > 0
        ? 'No se encontraron jugadores que coincidan con la búsqueda.'
        : playerStatusFilter === 'inactive'
          ? 'No hay estadísticas de jugadores inactivos.'
          : 'No hay estadísticas de jugadores activos.'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle spacing={8}>Estadísticas</PageTitle>

      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre..."
          ariaLabel="Buscar jugador por nombre"
          className="w-full"
        />
      </div>

      <Card padding={0}>
        {isLoading ? (
          <StatisticsSkeleton />
        ) : (
          <>
            <StatisticsToolbar
              filters={filters}
              onFiltersChange={setFilters}
              playerStatus={playerStatusFilter}
              onPlayerStatusChange={setPlayerStatusFilter}
              years={availableYears}
              matchCount={filteredMatches.length}
              playerCount={filteredPlayers.length}
              onClear={clearFilters}
            />
            <StatisticsTable
              stats={filteredPlayers}
              inactiveIds={inactiveIds}
              photoUrlById={photoUrlById}
              sortKey={sortKey}
              sortDir={sortDir}
              onToggleSort={toggleSort}
              emptyMessage={emptyMessage}
              onClearFilters={hasActiveFilters ? clearFilters : undefined}
            />
          </>
        )}
      </Card>
    </div>
  )
}
