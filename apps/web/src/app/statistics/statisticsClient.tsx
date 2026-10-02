'use client'

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { getMvpCountsByPlayerId, onlyFinalMatches } from '@fulbito/utils'
import type { Match, Player } from '@fulbito/types'
import { getShirtDutiesByPlayerId } from '@/lib/shirtDuty'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
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

  const stats = useMemo<StatRow[]>(() => {
    const map: Record<string, StatRow> = {}
    const finalMatches = onlyFinalMatches(matches)
    const shirtCountById = getShirtDutiesByPlayerId(finalMatches)
    const mvpCountById = getMvpCountsByPlayerId(finalMatches)
    for (const match of finalMatches) {
      const processPlayer =
        (team: 'A' | 'B') => (player: { id: string; name: string; goals: number; performance: number }) => {
          if (!map[player.id])
            map[player.id] = {
              id: player.id,
              name: player.name,
              matches: 0,
              goals: 0,
              totalPerformance: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              shirts: shirtCountById.get(player.id) ?? 0,
              mvps: mvpCountById.get(player.id) ?? 0,
            }
          map[player.id].matches++
          map[player.id].goals += player.goals
          map[player.id].totalPerformance += player.performance
          const teamAScore = match.teamAScore
          const teamBScore = match.teamBScore
          if (team === 'A') {
            if (teamAScore > teamBScore) map[player.id].wins++
            else if (teamAScore < teamBScore) map[player.id].losses++
            else map[player.id].draws++
          } else {
            if (teamBScore > teamAScore) map[player.id].wins++
            else if (teamBScore < teamAScore) map[player.id].losses++
            else map[player.id].draws++
          }
        }
      match.teamA.forEach(processPlayer('A'))
      match.teamB.forEach(processPlayer('B'))
    }
    Object.values(map).forEach((stat) => {
      stat.totalPerformance = stat.matches === 0 ? 0 : stat.totalPerformance / stat.matches
    })
    return Object.values(map)
  }, [matches])

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

  const activeEmptyMessage =
    stats.length === 0 ? 'No hay estadísticas disponibles.' : 'No hay estadísticas de jugadores activos.'

  const [playerStatusFilter, setPlayerStatusFilter] = useState<PlayerStatusFilter>('all')

  const filteredPlayres = playerStatusFilter === 'all' ? sorted : playerStatusFilter === 'active' ? activeStats : inactiveStats

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
        stats={filteredPlayres}
        inactiveIds={inactiveIds}
        sortKey={sortKey}
        sortDir={sortDir}
        onToggleSort={toggleSort}
        emptyMessage={activeEmptyMessage}
      />
    </div>
  )
}
