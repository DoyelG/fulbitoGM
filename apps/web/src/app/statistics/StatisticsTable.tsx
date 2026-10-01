'use client'

import Link from 'next/link'

export type StatRow = {
  id: string
  name: string
  matches: number
  goals: number
  totalPerformance: number
  wins: number
  losses: number
  draws: number
  shirts: number
  mvps: number
}

export type StatSortKey = keyof StatRow | 'goalsPerMatch' | 'winRate'

export type SortDir = 'asc' | 'desc'

type Props = {
  stats: StatRow[]
  sortKey: StatSortKey
  sortDir: SortDir
  onToggleSort: (key: StatSortKey) => void
  emptyMessage: string
  muted?: boolean
  inactiveIds?: Set<string>
}

const COLUMNS: { key: StatSortKey | null; label: string; ariaLabel?: string }[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'matches', label: 'Partidos' },
  { key: 'goals', label: 'Goles' },
  { key: 'goalsPerMatch', label: 'Goles/Partido' },
  { key: 'totalPerformance', label: 'Rendimiento' },
  { key: 'wins', label: 'Victorias' },
  { key: 'winRate', label: 'Tasa de victorias' },
  { key: null, label: 'Historial' },
  { key: 'shirts', label: 'Camisetas' },
  { key: 'mvps', label: '🏆 MVP', ariaLabel: 'Veces que fue MVP' },
]

const ariaSortFor = (key: StatSortKey, sortKey: StatSortKey, sortDir: SortDir) => {
  if (key !== sortKey) return undefined
  return sortDir === 'asc' ? ('ascending' as const) : ('descending' as const)
}

export default function StatisticsTable({
  stats,
  sortKey,
  sortDir,
  onToggleSort,
  emptyMessage,
  muted = false,
  inactiveIds = new Set<string>(),
}: Props) {
  const thColor = muted ? 'text-gray-500' : 'text-gray-700'

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <caption className="sr-only">Estadísticas por jugador</caption>
          <thead className="bg-gray-50">
            <tr>
              {COLUMNS.map(({ key, label, ariaLabel }) =>
                key === null ? (
                  <th key={label} scope="col" className={`px-4 py-3 text-left text-sm font-semibold ${thColor}`}>
                    {label}
                  </th>
                ) : (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={ariaSortFor(key, sortKey, sortDir)}
                    className={`px-4 py-3 text-left text-sm font-semibold ${thColor}`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleSort(key)}
                      aria-label={ariaLabel}
                      className="inline-flex items-center gap-1 rounded hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                      {label}
                      {sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : null}
                    </button>
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {stats.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-gray-800">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              stats.map((stat) => {
                const perMatch = stat.matches === 0 ? 0 : stat.goals / stat.matches
                const winRate = stat.matches === 0 ? 0 : (stat.wins / stat.matches) * 100
                const isRowMuted = muted || inactiveIds.has(stat.id)
                const nameColor = isRowMuted ? 'text-gray-400' : 'text-blue-600'
                const cellColor = isRowMuted ? 'text-gray-400' : 'text-gray-800'
                return (
                  <tr key={stat.id} className="hover:bg-gray-50">
                    <td className={`px-4 py-3 hover:underline ${nameColor}`}>
                      <Link href={`/players/${stat.id}`}>{stat.name}</Link>
                    </td>
                    <td className={`px-4 py-3 ${cellColor}`}>{stat.matches}</td>
                    <td className={`px-4 py-3 ${cellColor}`}>{stat.goals}</td>
                    <td className={`px-4 py-3 ${cellColor}`}>{perMatch.toFixed(2)}</td>
                    <td className={`px-4 py-3 ${cellColor}`}>{stat.totalPerformance.toFixed(2)}</td>
                    <td className={`px-4 py-3 ${cellColor}`}>{stat.wins}</td>
                    <td className={`px-4 py-3 ${cellColor}`}>{winRate.toFixed(1)}%</td>
                    <td className={`px-4 py-3 ${cellColor}`}>
                      {stat.wins}W-{stat.losses}L-{stat.draws}D
                    </td>
                    <td className={`px-4 py-3 ${cellColor}`}>{stat.shirts}</td>
                    <td className={`px-4 py-3 font-semibold ${cellColor}`}>{stat.mvps}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
