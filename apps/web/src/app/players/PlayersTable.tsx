'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useMemo, useState } from 'react'
import { FiEye, FiEdit2, FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi'
import StreakBadge from '@/components/StreakBadge'
import ActionRow, { type RowAction } from '@/components/ActionRow'
import type { Player, SkillMode } from '@fulbito/types'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { getGoalkeeping } from '@fulbito/utils'
import SkillBadge from '@/components/SkillBadge'
import Arrow from '@/app/shared/Icons/Arrow'
import SkillSortHeader from './SkillSortHeader'

export type PlayerRow = Player & {
  streak: { kind: 'win' | 'loss' | null; count: number }
  winGoalProgress: number
}

const columnHelper = createColumnHelper<PlayerRow>()

const NO_SKILL_VALUE = -1

function getSkillValue(player: Player, mode: SkillMode) {
  const value = mode === 'goalkeeper' ? getGoalkeeping(player) : player.skill
  return value ?? NO_SKILL_VALUE
}

type Props = {
  players: PlayerRow[]
  isAdmin: boolean
  onDelete: (playerId: string) => void
  onToggleActive: (playerId: string, inactive: boolean) => void
  emptyMessage: string
  globalFilter: string
  setGlobalFilter: (value: string) => void
}

export default function PlayersTable({
  players,
  isAdmin,
  onDelete,
  onToggleActive,
  emptyMessage,
  globalFilter,
  setGlobalFilter,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'skill', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [skillMode, setSkillMode] = useState<SkillMode>('player')

  const selectSkillMode = useCallback(
    (mode: SkillMode) => {
      setSkillMode(mode)
      setSorting(([current]) => {
        const isSameSort = current?.id === 'skill' && mode === skillMode
        return [{ id: 'skill', desc: isSameSort ? !current.desc : true }]
      })
    },
    [skillMode],
  )

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'photo',
        header: () => <span className="sr-only">Imagen</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <Image
            src={row.original.photoUrl ?? '/silhouette.svg'}
            alt={row.original.name}
            width={32}
            height={32}
            className={`object-cover w-full h-full max-w-8 max-h-8 rounded-full mx-auto ${row.original.inactive ? 'filter grayscale' : ''}`}
          />
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Nombre',
        enableSorting: true,
        cell: ({ getValue, row }) => (
          <Link
            href={`/players/${row.original.id}`}
            className={`hover:underline font-medium ${row.original.inactive ? 'text-gray-400' : 'text-brand'}`}
          >
            {getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor('skill', {
        header: ({ column }) => (
          <SkillSortHeader mode={skillMode} sortDirection={column.getIsSorted()} onSelect={selectSkillMode} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) => getSkillValue(rowA.original, skillMode) - getSkillValue(rowB.original, skillMode),
        cell: ({ row, column }) => {
          const isSortedBySkill = column.getIsSorted() !== false
          return (
            <div className="flex justify-end items-start gap-1">
              <SkillBadge
                skill={row.original.skill ?? 'unknown'}
                muted={row.original.inactive}
                soft={isSortedBySkill && skillMode !== 'player'}
              />
              <SkillBadge
                skill={getGoalkeeping(row.original)}
                muted={row.original.inactive}
                isGoalkeeper
                soft={isSortedBySkill && skillMode !== 'goalkeeper'}
              />
            </div>
          )
        },
      }),
      columnHelper.accessor('position', {
        header: 'Posición',
        enableSorting: true,
        cell: ({ getValue, row }) => (
          <span className={row.original.inactive ? 'text-gray-400' : 'text-gray-800'}>{getValue()}</span>
        ),
      }),
      columnHelper.accessor(
        (row) => {
          const { kind, count } = row.streak
          return kind === 'win' ? count : kind === 'loss' ? -count : 0
        },
        {
          id: 'streak',
          header: 'Racha',
          enableSorting: true,
          cell: ({ row }) => (
            <StreakBadge
              kind={row.original.streak.kind}
              count={row.original.streak.count}
              muted={row.original.inactive}
            />
          ),
        },
      ),
      columnHelper.accessor('winGoalProgress', {
        id: 'goal7',
        header: 'Objetivo (7W)',
        enableSorting: true,
        cell: ({ getValue, row }) => {
          const winGoalProgress = getValue()
          return winGoalProgress >= 7 ? (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${row.original.inactive ? 'bg-gray-200 text-gray-500' : 'text-white'}`}
              style={row.original.inactive ? undefined : { backgroundColor: 'hsl(270deg 80% 36%)' }}
            >
              Objetivo ✓
            </span>
          ) : (
            <div className="w-28">
              <div className="flex justify-between text-[10px] text-gray-700 mb-0.5">
                <span>W{Math.min(7, winGoalProgress)}</span>
                <span>7</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded">
                <div
                  className={`h-1.5 rounded ${row.original.inactive ? 'bg-gray-400' : ''}`}
                  style={{
                    width: `${(Math.min(7, winGoalProgress) / 7) * 100}%`,
                    backgroundColor: row.original.inactive ? undefined : 'hsl(270deg 75% 45%)',
                  }}
                />
              </div>
            </div>
          )
        },
      }),
    ],
    [skillMode, selectSkillMode],
  )

  const table = useReactTable({
    data: players,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      return normalize(row.original.name).includes(normalize(filterValue))
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div>
      <div className="mb-4">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`${header.column.id === 'photo' ? 'py-1 pl-2' : 'px-4 py-3'} ${header.column.id === 'skill' ? 'pr-8 lg:pr-20' : ''} text-left text-sm font-semibold text-gray-700 select-none ${header.column.getCanSort() ? 'cursor-pointer' : ''} ${header.column.id === 'skill' ? 'w-1 whitespace-nowrap' : ''}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.id !== 'skill' && header.column.getIsSorted() && (
                          <span className="ml-1 inline-flex align-middle">
                            <Arrow direction={header.column.getIsSorted() === 'asc' ? 'up' : 'down'} />
                          </span>
                        )}
                      </th>
                    ))}
                    {isAdmin && <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-gray-800">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => {
                    const player = row.original
                    const actions: RowAction[] = [
                      { icon: <FiEye size={16} />, variant: 'primary', href: `/players/${player.id}`, tooltip: 'Ver' },
                      ...(isAdmin
                        ? [
                            {
                              icon: <FiEdit2 size={16} />,
                              variant: 'primary' as const,
                              href: `/players/edit/${player.id}`,
                              tooltip: 'Editar',
                            },
                            player.inactive
                              ? {
                                  icon: <FiUserCheck size={16} />,
                                  variant: 'primary' as const,
                                  onClick: () => onToggleActive(player.id, false),
                                  tooltip: 'Activar',
                                }
                              : {
                                  icon: <FiUserX size={16} />,
                                  variant: 'danger' as const,
                                  onClick: () => onToggleActive(player.id, true),
                                  tooltip: 'Desactivar',
                                },
                            {
                              icon: <FiTrash2 size={17} />,
                              variant: 'danger' as const,
                              onClick: () => onDelete(player.id),
                              tooltip: 'Eliminar',
                            },
                          ]
                        : []),
                    ]
                    return (
                      <ActionRow key={player.id} actions={actions}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={`${cell.column.id === 'photo' ? 'py-1 pl-2' : 'px-4 py-3'} ${cell.column.id === 'skill' ? 'pr-8 lg:pr-20' : ''}`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </ActionRow>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
