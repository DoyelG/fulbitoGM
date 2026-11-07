'use client'

import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { computePlayerStatRows, normalizeForSearch } from '@fulbito/utils'
import type { Match, Player } from '@fulbito/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SearchInput from '@/components/SearchInput'
import StatisticsTable, { type StatRow, type StatSortKey, type SortDir } from './StatisticsTable'
import PageTitle from '@/components/PageTitle'
import PlayerStatusSelect, { type PlayerStatusFilter } from './PlayerStatusSelect'

export default function StatisticsClient({
  players: propsPlayers,
  matches: propsMatches,
}: {
  players: Player[]
  matches: Match[]
}) {
  const { hydrateMatches, matches, resetAndReload: resetMatches } = useMatchStore()
  const { hydratePlayers, players: storePlayers, resetAndReload: resetPlayers } = usePlayerStore()

  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    hydrateMatches(propsMatches)
    hydratePlayers(propsPlayers)
    resetMatches()
    resetPlayers()
  }, [hydrateMatches, propsMatches, hydratePlayers, propsPlayers, resetMatches, resetPlayers])

  const stats = useMemo<StatRow[]>(() => computePlayerStatRows(storePlayers, matches), [storePlayers, matches])

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

  const [playerStatusFilter, setPlayerStatusFilter] = useState<PlayerStatusFilter>('all')

  const [searchQuery, setSearchQuery] = useState('')

  const statusFiltered =
    playerStatusFilter === 'all' ? sorted : playerStatusFilter === 'active' ? activeStats : inactiveStats

  const normalizedQuery = normalizeForSearch(searchQuery.trim())
  const filteredPlayers = normalizedQuery
    ? statusFiltered.filter((stat) => normalizeForSearch(stat.name).includes(normalizedQuery))
    : statusFiltered

  const emptyMessage =
    stats.length === 0
      ? 'No hay estadísticas disponibles.'
      : normalizedQuery && statusFiltered.length > 0
        ? 'No se encontraron jugadores que coincidan con la búsqueda.'
        : playerStatusFilter === 'inactive'
          ? 'No hay estadísticas de jugadores inactivos.'
          : 'No hay estadísticas de jugadores activos.'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle
        spacing={8}
        actions={<PlayerStatusSelect value={playerStatusFilter} onChange={setPlayerStatusFilter} />}
      >
        Estadísticas
      </PageTitle>

      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre..."
          ariaLabel="Buscar jugador por nombre"
          className="w-full"
        />
      </div>

      <StatisticsTable
        stats={filteredPlayers}
        inactiveIds={inactiveIds}
        photoUrlById={photoUrlById}
        sortKey={sortKey}
        sortDir={sortDir}
        onToggleSort={toggleSort}
        emptyMessage={emptyMessage}
      />
    </div>
  )
}
