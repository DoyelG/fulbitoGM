'use client'

import Link from 'next/link'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { calculateAllCurrentStreaks } from '@/lib/playerStats'
import { onlyFinalMatches } from '@fulbito/utils'
import type { Match, Player } from '@fulbito/types'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { FiChevronDown, FiUserCheck, FiUserX, FiTrash2 } from 'react-icons/fi'
import PlayersTable, { type PlayerRow } from './PlayersTable'
import Modal from '@/components/Modal'

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
  const [showToggleModal, setShowToggleModal] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<{ playerId: string; inactive: boolean } | null>(null)
  const { deletePlayer, updatePlayer, hydratePlayers, players: storePlayers, resetAndReload: resetPlayers } = usePlayerStore()
  const { hydrateMatches, matches: storeMatches, resetAndReload: resetMatches } = useMatchStore()
  const [globalFilter, setGlobalFilter] = useState('')


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

  const toggleTargetPlayer = useMemo(
    () => storePlayers.find((p) => p.id === toggleTarget?.playerId) ?? null,
    [storePlayers, toggleTarget],
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
    setToggleTarget({ playerId, inactive })
    setShowToggleModal(true)
  }, [])

  const handleConfirmToggle = useCallback(() => {
    if (!toggleTarget) return
    updatePlayer(toggleTarget.playerId, { inactive: toggleTarget.inactive })
    setShowToggleModal(false)
    setToggleTarget(null)
  }, [updatePlayer, toggleTarget])

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

          <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>
        <PlayersTable
          players={activePlayers}
          isAdmin={isAdmin}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          emptyMessage="No hay jugadores activos aún."
        />
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
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              emptyMessage="No hay jugadores inactivos."
            />
          </div>
        )}
      </div>
      )}


      <Modal
        title="Confirmar eliminación"
        open={showModal}
        onClose={() => setShowModal(false)}>
        <div className="p-2 text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-red-100">
            <FiTrash2 className="text-red-600" size={20} />
          </div>
          <p className="text-gray-600">
            ¿Estás seguro de que querés eliminar a{' '}
            <span className="font-medium text-gray-900">{selectedPlayer?.name}</span>?
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="flex-1 px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        title="Confirmar cambio de estado"
        open={showToggleModal}
        onClose={() => setShowToggleModal(false)}>
        <div className="p-2 text-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${
              toggleTarget?.inactive ? 'bg-red-100' : 'bg-brand/10'
            }`}
          >
            {toggleTarget?.inactive ? (
              <FiUserX className="text-red-600" size={20} />
            ) : (
              <FiUserCheck className="text-brand" size={20} />
            )}
          </div>
          <p className="text-gray-600">
            ¿Estás seguro de que querés {toggleTarget?.inactive ? 'desactivar' : 'activar'} a{' '}
            <span className="font-medium text-gray-900">{toggleTargetPlayer?.name}</span>?
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowToggleModal(false)}
              className="flex-1 px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmToggle}
              className="flex-1 px-5 py-2 rounded-lg bg-brand text-white hover:bg-brand/90 transition"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
