'use client'

import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { computePlayerStatRows } from '@fulbito/utils'
import type { Match, Player } from '@fulbito/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StatisticsTable, { type StatRow, type StatSortKey, type SortDir } from './StatisticsTable'

type PlayerStatusFilter = 'all' | 'active' | 'inactive'

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
    return [...stats].sort((a, b) => {
      const av = getValue(a, sortKey)
      const bv = getValue(b, sortKey)
      if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * dir
      const an = Number(av)
      const bn = Number(bv)
      if (Number.isNaN(an) || Number.isNaN(bn)) return 0
      if (an === bn) return 0
      return an > bn ? dir : -dir
    })
  }, [stats, sortKey, sortDir])

  const inactiveIds = useMemo(
    () => new Set(storePlayers.filter((player) => player.inactive).map((player) => player.id)),
    [storePlayers],
  )

  const activeStats = useMemo(() => sorted.filter((stat) => !inactiveIds.has(stat.id)), [sorted, inactiveIds])

  const inactiveStats = useMemo(() => sorted.filter((stat) => inactiveIds.has(stat.id)), [sorted, inactiveIds])

  const [playerStatusFilter, setPlayerStatusFilter] = useState<PlayerStatusFilter>('all')

  const filteredPlayers =
    playerStatusFilter === 'all' ? sorted : playerStatusFilter === 'active' ? activeStats : inactiveStats

  const emptyMessage =
    stats.length === 0
      ? 'No hay estadísticas disponibles.'
      : playerStatusFilter === 'inactive'
        ? 'No hay estadísticas de jugadores inactivos.'
        : 'No hay estadísticas de jugadores activos.'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-4 min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between mb-8">
        <h1 className="text-3xl font-bold">Estadísticas</h1>

        <div className="flex flex-col gap-1 min-[700px]:flex-row min-[700px]:items-center min-[700px]:gap-2">
          <label htmlFor="player-status-filter" className="text-sm font-medium text-black">
            Filtrar por estado de jugador:
          </label>
          <select
            name="player-status-filter"
            id="player-status-filter"
            value={playerStatusFilter}
            onChange={(event) => setPlayerStatusFilter(event.target.value as PlayerStatusFilter)}
            className="h-10 w-full max-w-52 min-[700px]:w-auto rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm"
          >
            <option value="all">Todos los jugadores</option>
            <option value="active">Solo Activos</option>
            <option value="inactive">Solo Inactivos</option>
          </select>
        </div>
      </div>

      <StatisticsTable
        stats={filteredPlayers}
        inactiveIds={inactiveIds}
        sortKey={sortKey}
        sortDir={sortDir}
        onToggleSort={toggleSort}
        emptyMessage={emptyMessage}
      />
    </div>
  )
}
