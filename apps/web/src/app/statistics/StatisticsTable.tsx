'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import EmptyState from '@/components/EmptyState'

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
  onClearFilters?: () => void
  inactiveIds?: Set<string>
  photoUrlById?: Map<string, string>
}

type Column = {
  key: StatSortKey
  label: string
  title: string
  compact?: boolean
  centered?: boolean
  spacious?: boolean
  width?: string
}

const COLUMNS: Column[] = [
  { key: 'matches', label: 'PJ', title: 'Partidos jugados', width: 'w-24' },
  { key: 'goals', label: 'Goles', title: 'Goles', width: 'w-24' },
  { key: 'goalsPerMatch', label: 'G/PJ', title: 'Goles por partido', width: 'w-32' },
  { key: 'totalPerformance', label: 'Rend.', title: 'Rendimiento promedio', width: 'w-32' },
  {
    key: 'wins',
    label: 'V · E · D',
    title: 'Victorias, empates y derrotas',
    compact: true,
    centered: true,
    spacious: true,
  },
  { key: 'winRate', label: '% Victorias', title: 'Porcentaje de victorias', compact: true },
  {
    key: 'shirts',
    label: 'Camisetas',
    title: 'Veces que lavó las camisetas',
    compact: true,
    centered: true,
    spacious: true,
  },
  { key: 'mvps', label: 'MVP', title: 'Veces que fue MVP', compact: true, centered: true, spacious: true },
]

const MEDAL_STYLES = ['bg-amber-100 text-amber-800', 'bg-gray-200 text-gray-700', 'bg-orange-100 text-orange-800']

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronUpDownIcon className="size-3.5 text-gray-300 group-hover:text-gray-500" aria-hidden />
  return dir === 'asc' ? (
    <ChevronUpIcon className="size-3.5" aria-hidden />
  ) : (
    <ChevronDownIcon className="size-3.5" aria-hidden />
  )
}

function SortButton({
  column,
  sortKey,
  sortDir,
  onToggleSort,
}: {
  column: Pick<Column, 'key' | 'label' | 'title'>
  sortKey: StatSortKey
  sortDir: SortDir
  onToggleSort: (key: StatSortKey) => void
}) {
  const active = column.key === sortKey
  return (
    <button
      type="button"
      onClick={() => onToggleSort(column.key)}
      aria-label={`Ordenar por ${column.title}`}
      title={column.title}
      className={`group inline-flex items-center gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        active ? 'text-primary' : 'hover:text-gray-900'
      }`}
    >
      {column.label}
      <SortIcon active={active} dir={sortDir} />
    </button>
  )
}

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
  onClearFilters,
  inactiveIds = new Set<string>(),
  photoUrlById = new Map<string, string>(),
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const isEmpty = stats.length === 0

  useEffect(() => {
    const container = containerRef.current
    const table = container?.firstElementChild
    if (!container || !table) return
    const update = () => setIsOverflowing(container.scrollWidth > container.clientWidth)
    const observer = new ResizeObserver(update)
    observer.observe(container)
    observer.observe(table)
    update()
    return () => observer.disconnect()
  }, [isEmpty])

  if (isEmpty) {
    return (
      <EmptyState
        icon={ChartBarIcon}
        title={emptyMessage}
        action={onClearFilters ? { label: 'Limpiar filtros', onClick: onClearFilters } : null}
      />
    )
  }

  const showMedals = sortKey !== 'name' && sortDir === 'desc'
  const band = (key: StatSortKey) => (key === sortKey ? 'bg-primary/5' : '')
  const nameBackground = sortKey === 'name' ? 'bg-[color-mix(in_oklab,var(--color-primary)_5%,white)]' : 'bg-white'
  const nameDivider = isOverflowing ? 'shadow-[inset_-1px_0_0_var(--color-gray-200)]' : ''

  return (
    <div ref={containerRef} className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <caption className="sr-only">Estadísticas por jugador</caption>
        <thead>
          <tr className="border-b border-gray-200 text-xs font-medium text-gray-500">
            <th
              scope="col"
              aria-sort={ariaSortFor('name', sortKey, sortDir)}
              className={`sticky left-0 z-10 ${nameBackground} ${nameDivider} px-4 py-3 text-left`}
            >
              <SortButton
                column={{ key: 'name', label: 'Jugador', title: 'Nombre' }}
                sortKey={sortKey}
                sortDir={sortDir}
                onToggleSort={onToggleSort}
              />
            </th>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                aria-sort={ariaSortFor(column.key, sortKey, sortDir)}
                className={`whitespace-nowrap py-3 ${column.spacious ? 'px-8' : 'px-3'} ${column.centered ? 'text-center' : 'text-right'} ${column.compact ? 'w-px' : ''} ${column.width ?? ''} ${band(column.key)}`}
              >
                <SortButton column={column} sortKey={sortKey} sortDir={sortDir} onToggleSort={onToggleSort} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {stats.map((stat, index) => {
            const perMatch = stat.matches === 0 ? 0 : stat.goals / stat.matches
            const winRate = stat.matches === 0 ? 0 : (stat.wins / stat.matches) * 100
            const isInactive = inactiveIds.has(stat.id)
            const textColor = isInactive ? 'text-gray-400' : 'text-gray-700'
            const numberCell = (key: StatSortKey, extra = '', align = 'text-right', padding = 'px-3') =>
              `whitespace-nowrap py-3 ${padding} ${align} tabular-nums ${textColor} ${band(key)} ${extra}`.trim()
            const medal = showMedals && index < 3 ? MEDAL_STYLES[index] : 'text-gray-400'

            return (
              <tr key={stat.id} className="group transition-colors hover:bg-gray-50">
                <td
                  className={`sticky left-0 z-10 ${nameBackground} ${nameDivider} px-4 py-2.5 transition-colors group-hover:bg-gray-50`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${medal}`}
                    >
                      {index + 1}
                    </span>
                    <Image
                      src={photoUrlById.get(stat.id) ?? '/silhouette.svg'}
                      alt=""
                      width={32}
                      height={32}
                      className={`size-8 shrink-0 rounded-full object-cover ${isInactive ? 'grayscale' : ''}`}
                    />
                    <Link
                      href={`/players/${stat.id}`}
                      className={`whitespace-nowrap font-medium hover:text-primary hover:underline ${
                        isInactive ? 'text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {stat.name}
                    </Link>
                    {isInactive && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">Inactivo</span>
                    )}
                  </div>
                </td>
                <td className={numberCell('matches')}>{stat.matches}</td>
                <td className={numberCell('goals', `${isInactive ? '' : 'text-gray-900'}`)}>{stat.goals}</td>
                <td className={numberCell('goalsPerMatch')}>{perMatch.toFixed(2)}</td>
                <td className={numberCell('totalPerformance')}>{stat.totalPerformance.toFixed(2)}</td>
                <td className={numberCell('wins', '', 'text-center', 'px-8')}>
                  <span className="sr-only">
                    {stat.wins} victorias, {stat.draws} empates, {stat.losses} derrotas
                  </span>
                  <span aria-hidden="true" className="inline-flex items-center justify-center">
                    <span className={`w-7 text-right ${isInactive ? '' : 'font-medium text-green-700'}`}>
                      {stat.wins}
                    </span>
                    <span className="px-1 text-gray-300">·</span>
                    <span className={`w-7 text-center ${isInactive ? '' : 'text-gray-500'}`}>{stat.draws}</span>
                    <span className="px-1 text-gray-300">·</span>
                    <span className={`w-7 text-left ${isInactive ? '' : 'text-red-600'}`}>{stat.losses}</span>
                  </span>
                </td>
                <td className={numberCell('winRate')}>
                  <div className="flex items-center justify-end gap-2">
                    <span className="w-9">{winRate.toFixed(0)}%</span>
                    <div className="h-1.5 w-14 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                      <div
                        className={`h-full rounded-full ${isInactive ? 'bg-gray-300' : 'bg-primary'}`}
                        style={{ width: `${winRate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className={numberCell('shirts', '', 'text-center', 'px-8')}>{stat.shirts}</td>
                <td className={numberCell('mvps', '', 'text-center', 'px-8')}>
                  {stat.mvps > 0 ? (
                    <span
                      className={`inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isInactive ? 'bg-gray-100 text-gray-400' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {stat.mvps}
                    </span>
                  ) : (
                    <span className="text-gray-300 px-2.5 py-0.5">0</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
