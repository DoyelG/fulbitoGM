'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { FiEye, FiEdit2, FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi'
import SkillBadge from '@/components/SkillBadge'
import StreakBadge from '@/components/StreakBadge'
import ActionRow, { type RowAction } from '@/components/ActionRow'
import type { Player } from '@fulbito/types'
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

export type PlayerRow = Player & {
  streak: { kind: 'win' | 'loss' | null; count: number }
  winGoalProgress: number
}

const columnHelper = createColumnHelper<PlayerRow>()

type Props = {
  players: PlayerRow[]
  isAdmin: boolean
  onDelete: (playerId: string) => void
  onToggleActive: (playerId: string, inactive: boolean) => void
  emptyMessage: string,
  globalFilter: string,
  setGlobalFilter: (value: string) => void
}

export default function PlayersTable({ players, isAdmin, onDelete, onToggleActive, emptyMessage ,globalFilter , setGlobalFilter}: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'skill', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'photo',
        header: 'Imagen',
        enableSorting: false,
        cell: ({ row }) => (
          <Image
            src={row.original.photoUrl ?? '/silhouette.svg'}
            alt={row.original.name}
            width={32}
            height={32}
            className={`object-cover w-full h-full max-w-8 max-h-8 rounded-full ${row.original.inactive ? 'filter grayscale' : ''}`}
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
        header: 'Habilidad',
        enableSorting: true,
        cell: ({ getValue, row }) => <SkillBadge skill={getValue() ?? 'unknown'} muted={row.original.inactive} />,
        sortUndefined: -1,
      }),
      columnHelper.accessor('position', {
        header: 'Posición',
        enableSorting: true,
        cell: ({ getValue, row }) => (
          <span className={row.original.inactive ? 'text-gray-400' : 'text-gray-800'}>{getValue()}</span>
        ),
      }),
      columnHelper.accessor((row) => {
        const st = row.streak
        return st.kind === 'win' ? st.count : st.kind === 'loss' ? -st.count : 0
      }, {
        id: 'streak',
        header: 'Racha',
        enableSorting: true,
        cell: ({ row }) => (
          <StreakBadge kind={row.original.streak.kind} count={row.original.streak.count} muted={row.original.inactive} />
        ),
      }),
      columnHelper.accessor('winGoalProgress', {
        id: 'goal7',
        header: 'Objetivo (7W)',
        enableSorting: true,
        cell: ({ getValue, row }) => {
          const v = getValue()
          return v >= 7 ? (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${row.original.inactive ? 'bg-gray-200 text-gray-500' : 'text-white'}`}
              style={row.original.inactive ? undefined : { backgroundColor: 'hsl(270deg 80% 36%)' }}
            >
              Objetivo ✓
            </span>
          ) : (
            <div className="w-28">
              <div className="flex justify-between text-[10px] text-gray-700 mb-0.5">
                <span>W{Math.min(7, v)}</span>
                <span>7</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded">
                <div
                  className={`h-1.5 rounded ${row.original.inactive ? 'bg-gray-400' : ''}`}
                  style={{
                    width: `${(Math.min(7, v) / 7) * 100}%`,
                    backgroundColor: row.original.inactive ? undefined : 'hsl(270deg 75% 45%)',
                  }}
                />
              </div>
            </div>
          )
        },
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: players,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const normalize = (s: string) =>
        s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
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
                      className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 select-none ${header.column.getCanSort() ? 'cursor-pointer' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && ' ▲'}
                      {header.column.getIsSorted() === 'desc' && ' ▼'}
                    </th>
                  ))}
                  {isAdmin && (
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>
                  )}
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
                          { icon: <FiEdit2 size={16} />, variant: 'primary' as const, href: `/players/edit/${player.id}`, tooltip: 'Editar' },
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
                          { icon: <FiTrash2 size={16} />, variant: 'danger' as const, onClick: () => onDelete(player.id), tooltip: 'Eliminar' },
                        ]
                      : []),
                  ]
                  return (
                    <ActionRow key={player.id} actions={actions}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
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
