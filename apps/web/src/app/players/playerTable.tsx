import ActionRow, { RowAction } from "@/components/ActionRow";
import SkillBadge from "@/components/SkillBadge";
import StreakBadge from "@/components/StreakBadge";
import { useMatchStore } from "@/store/useMatchStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Player } from "@fulbito/types";
import { calculateAllCurrentStreaks, onlyFinalMatches } from "@fulbito/utils";
import { ColumnFiltersState, createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react"
import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";

type PlayerRow = Player & {
  streak: { kind: 'win' | 'loss' | null; count: number }
  winGoalProgress: number
}

type Props = {
  players: Player[]
  isAdmin: boolean
  table: []
}

export function PlayerTable ({ players, isAdmin}: Props) {
  const { deletePlayer, hydratePlayers, players: storePlayers, inactivePlayer, resetAndReload: resetPlayers } = usePlayerStore()
  const { hydrateMatches, matches: storeMatches, resetAndReload: resetMatches } = useMatchStore()

  const [sorting, setSorting] = useState<SortingState>([{ id: 'skill', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const columnHelper = createColumnHelper<PlayerRow>()

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
        cell: ({ getValue }) => <SkillBadge skill={getValue() ?? 'unknown'} />,
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
        cell: ({ row }) => {
          const st = row.original.streak
          return st.kind ? (
            <StreakBadge kind={st.kind} count={st.count} />
          ) : (
            <span className={`text-sm ${row.original.inactive ? 'text-gray-400' : 'text-gray-800'}`}>—</span>
          )
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
  const streaks = useMemo(
      () => calculateAllCurrentStreaks(onlyFinalMatches(storeMatches)),
      [storeMatches],
  )
  const tableData: PlayerRow[] = useMemo(
    () =>
      players.map((p) => {
        const st = streaks[p.id] ?? { kind: null as 'win' | 'loss' | null, count: 0 }
        return { ...p, streak: st, winGoalProgress: st.kind === 'win' ? st.count : 0 }
      }),
    [players, streaks],
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
  

  return (
    <div className="bg-gray-50 shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-left text-sm font-semibold text-gray-500 select-none ${header.column.getCanSort() ? 'cursor-pointer' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && ' ▲'}
                      {header.column.getIsSorted() === 'desc' && ' ▼'}
                    </th>
                  ))}
                  {isAdmin && (
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-500">Acciones</th>
                  )}
                </tr>
              ))}
          </thead>

          <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
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
                    <ActionRow key={player.id} actions={actions} className={row.original.inactive ? 'text-white' : 'text-brand'}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-gray-50">
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
  )
}
