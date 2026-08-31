'use client'

import Link from 'next/link'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { calculateAllCurrentStreaks } from '@/lib/playerStats'
import { onlyFinalMatches } from '@fulbito/utils'
import type { Match, Player } from '@fulbito/types'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import PlayersTable, { type PlayerRow } from './PlayersTable'
import { Backdrop } from '@/components/Backdrop'

export default function PlayersClient({
  players: initialPlayers,
  matches: initialMatches,
}: {
  players: Player[]
  matches: Match[]
}) {
  const { isAdmin } = useFirebaseAuth()
  const [showModal, setShowModal] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [showInactiveTable, setShowInactiveTable] = useState(false)
  const { deletePlayer, updatePlayer, hydratePlayers, players: storePlayers, resetAndReload: resetPlayers } = usePlayerStore()
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

  const streaks = useMemo(
    () => calculateAllCurrentStreaks(onlyFinalMatches(storeMatches)),
    [storeMatches],
  )

  const tableData: PlayerRow[] = useMemo(
    () =>
      storePlayers.map((p) => {
        const st = streaks[p.id] ?? { kind: null as 'win' | 'loss' | null, count: 0 }
        return { ...p, streak: st, winGoalProgress: st.kind === 'win' ? st.count : 0 }
      }),
    [storePlayers, streaks],
  )

  const activePlayers = useMemo(() => tableData.filter((p) => !p.inactive), [tableData])
  const inactivePlayers = useMemo(() => tableData.filter((p) => p.inactive), [tableData])

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

  const handleToggleActive = useCallback((playerId: string, inactive: boolean) => {
    updatePlayer(playerId, { inactive })
  }, [updatePlayer])

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

      <div className="mb-6">
        <PlayersTable
          players={activePlayers}
          isAdmin={isAdmin}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          emptyMessage="No hay jugadores activos aún."
        />
      </div>
{isAdmin && (
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setShowInactiveTable((v) => !v)}
          aria-expanded={showInactiveTable}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          <h2 className="text-lg font-semibold text-gray-800">Inactivos</h2>
          <FiChevronDown
            size={20}
            className={`text-gray-500 transition-transform duration-200 ${showInactiveTable ? 'rotate-180' : ''}`}
          />
        </button>
        {showInactiveTable && (
          <div className="px-4 pb-4 pt-1 border-t border-gray-100">
            <PlayersTable
              players={inactivePlayers}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              emptyMessage="No hay jugadores inactivos."
            />
          </div>
        )}
      </div>
      )}


      {showModal && (
        <Backdrop onClose={() => setShowModal(false)} title="Confirmar eliminación">
          <div className="bg-white p-6 rounded-xl max-w-md">
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
        </Backdrop>
      )}
    </div>
  )
}
