'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import SkillBadge from '@/components/SkillBadge'
import StreakBadge from '@/components/StreakBadge'
import { calculateAllCurrentStreaks } from '@/lib/playerStats'
import type { Match, Player } from '@fulbito/types'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'
import ActionRow, { type RowAction } from '@/components/ActionRow'
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

type PlayerRow = Player & {
  streak: { kind: 'win' | 'loss' | null; count: number }
  winGoalProgress: number
}

const columnHelper = createColumnHelper<PlayerRow>()

export default function PlayersClient({
  players: initialPlayers,
  matches: initialMatches,
}: {
  players: Player[]
  matches: Match[]
}) {
  const { data: session } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const isAdmin = (session?.user as unknown as { role?: string })?.role === 'ADMIN'

  const { deletePlayer, hydratePlayers, players: storePlayers, resetAndReload: resetPlayers } = usePlayerStore()
  const { hydrateMatches, matches: storeMatches, resetAndReload: resetMatches } = useMatchStore()

  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    hydratePlayers(initialPlayers)
    hydrateMatches(initialMatches)
    resetPlayers()
    resetMatches()
  }, [hydratePlayers, initialPlayers, hydrateMatches, initialMatches, resetPlayers, resetMatches])

  const streaks = useMemo(() => calculateAllCurrentStreaks(storeMatches), [storeMatches])

  const tableData: PlayerRow[] = useMemo(
    () =>
      storePlayers.map((p) => {
        const st = streaks[p.id] ?? { kind: null as 'win' | 'loss' | null, count: 0 }
        return { ...p, streak: st, winGoalProgress: st.kind === 'win' ? st.count : 0 }
      }),
    [storePlayers, streaks],
  )

  const [sorting, setSorting] = useState<SortingState>([{ id: 'skill', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

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
            className="object-cover w-full h-full max-w-8 max-h-8 rounded-full"
          />
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Nombre',
        enableSorting: true,
        cell: ({ getValue, row }) => (
          <Link href={`/players/${row.original.id}`} className="text-brand hover:underline font-medium">
            {getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor('skill', {
        header: 'Habilidad',
        enableSorting: true,
        cell: ({ getValue }) => <SkillBadge skill={getValue() ?? 'unknown'} />,
        sortUndefined: -1,
      }),
      columnHelper.accessor('position', {
        header: 'Posición',
        enableSorting: true,
        cell: ({ getValue }) => <span className="text-gray-800">{getValue()}</span>,
      }),
      columnHelper.accessor((row) => {
        const st = row.streak
        return st.kind === 'win' ? st.count : st.kind === 'loss' ? -st.count : 0
      }, {
        id: 'streak',
        header: 'Racha',
        enableSorting: true,
        cell: ({ row }) => {
          const st = row.original.streak
          return st.kind ? <StreakBadge kind={st.kind} count={st.count} /> : <span className="text-sm text-gray-800">—</span>
        },
      }),
      columnHelper.accessor('winGoalProgress', {
        id: 'goal7',
        header: 'Objetivo (7W)',
        enableSorting: true,
        cell: ({ getValue }) => {
          const v = getValue()
          return v >= 7 ? (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs text-white"
              style={{ backgroundColor: 'hsl(270deg 80% 36%)' }}
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
                  className="h-1.5 rounded"
                  style={{ width: `${(Math.min(7, v) / 7) * 100}%`, backgroundColor: 'hsl(270deg 75% 45%)' }}
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
    data: tableData,
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

  const selectedPlayer = useMemo(
    () => storePlayers.find((p) => p.id === selectedPlayerId) ?? null,
    [storePlayers, selectedPlayerId],
  )

  const handleDelete = useCallback((playerId: string) => {
    setShowModal(true)
    setSelectedPlayerId(playerId)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    deletePlayer(selectedPlayerId as string)
    setShowModal(false)
  }, [deletePlayer, selectedPlayerId])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Jugadores</h1>
        {isAdmin && (
          <Link href="/players/new" className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand/90">
            Agregar jugador
          </Link>
        )}
      </div>

      <div className="mb-10">
        <input
          type="text"
          name="searchPlayer"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

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
                    No hay jugadores agregados aún.
                    {isAdmin && (
                      <>
                        {' '}
                        <Link href="/players/new" className="text-brand hover:underline">
                          Agrega tu primer jugador
                        </Link>
                      </>
                    )}
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
                          { icon: <FiTrash2 size={16} />, variant: 'danger' as const, onClick: () => handleDelete(player.id), tooltip: 'Eliminar' },
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

      <dialog
        open={showModal}
        className="rounded-xl p-0 border-none shadow-2xl w-full h-full fixed inset-0 bg-black/40"
      >
        <div className="bg-white p-6 rounded-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Confirmar eliminación</h2>
          <p className="text-gray-600 mb-6">¿Estás seguro de que querés eliminar a {selectedPlayer?.name}?</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              Eliminar
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
