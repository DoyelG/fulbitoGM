'use client'

import Link from 'next/link'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import { calculateAllCurrentStreaks } from '@/lib/playerStats'
import { onlyFinalMatches } from '@fulbito/utils'
import type { Match, Player } from '@fulbito/types'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { FiUserCheck, FiUserX, FiTrash2 } from 'react-icons/fi'
import PlayersTable, { type PlayerRow } from './PlayersTable'
import Modal from '@/components/Modal'
import SearchInput from '@/components/SearchInput'
import Chevron from '../shared/Icons/Chevron'

export default function PlayersClient({
  players: initialPlayers,
  matches: initialMatches,
}: {
  players: Player[]
  matches: Match[]
}) {
  const canManage = useCanManageTournament()
  const [showModal, setShowModal] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [showInactiveTable, setShowInactiveTable] = useState(false)
  const [showToggleModal, setShowToggleModal] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<{ playerId: string; inactive: boolean } | null>(null)
  const {
    deletePlayer,
    updatePlayer,
    hydratePlayers,
    players: storePlayers,
    resetAndReload: resetPlayers,
  } = usePlayerStore()
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

  const streaks = useMemo(() => calculateAllCurrentStreaks(onlyFinalMatches(storeMatches)), [storeMatches])

  const tableData: PlayerRow[] = useMemo(
    () =>
      storePlayers.map((player) => {
        const streak = streaks[player.id] ?? { kind: null as 'win' | 'loss' | null, count: 0 }
        return { ...player, streak, winGoalProgress: streak.kind === 'win' ? streak.count : 0 }
      }),
    [storePlayers, streaks],
  )

  const activePlayers = useMemo(() => tableData.filter((player) => !player.inactive), [tableData])
  const inactivePlayers = useMemo(() => tableData.filter((player) => player.inactive), [tableData])

  const selectedPlayer = useMemo(
    () => storePlayers.find((player) => player.id === selectedPlayerId) ?? null,
    [storePlayers, selectedPlayerId],
  )

  const toggleTargetPlayer = useMemo(
    () => storePlayers.find((player) => player.id === toggleTarget?.playerId) ?? null,
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
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">Jugadores</h1>
        {canManage && (
          <Link
            href="/players/new"
            className="px-4 py-2 text-sm font-medium border border-primary-dark bg-primary-gradient text-white rounded-xl hover:bg-primary-gradient-dark hover:border-primary hover:ring-2 hover:ring-primary/30"
          >
            Agregar jugador
          </Link>
        )}
      </div>

      <div className="mb-6">
        <SearchInput
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder="Buscar por nombre..."
          ariaLabel="Buscar jugador por nombre"
          className="w-full"
        />
      </div>
      <PlayersTable
        players={activePlayers}
        canManage={canManage}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        emptyMessage="No hay jugadores activos aún."
      />
      {canManage && inactivePlayers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setShowInactiveTable((isShown) => !isShown)}
            aria-expanded={showInactiveTable}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <h2 className="text-lg font-semibold text-gray-800">Inactivos</h2>
            <Chevron direction={showInactiveTable ? 'up' : 'down'} className="h-5 w-5 text-gray-500" />
          </button>
          {showInactiveTable && (
            <div className="px-4 pb-4 pt-1 border-t border-gray-100">
              <PlayersTable
                players={inactivePlayers}
                canManage={canManage}
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

      <Modal title="Confirmar eliminación" open={showModal} onClose={() => setShowModal(false)}>
        <div className="p-2 text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-orange-100">
            <FiTrash2 className="text-orange-700" size={20} />
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
              className="flex-1 px-5 py-2 rounded-lg bg-orange-700 text-white hover:bg-orange-800 transition"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      <Modal title="Confirmar cambio de estado" open={showToggleModal} onClose={() => setShowToggleModal(false)}>
        <div className="p-2 text-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${
              toggleTarget?.inactive ? 'bg-orange-100' : 'bg-primary/10'
            }`}
          >
            {toggleTarget?.inactive ? (
              <FiUserX className="text-orange-700" size={20} />
            ) : (
              <FiUserCheck className="text-primary" size={20} />
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
              className="px-4 py-2 text-sm font-medium flex-1 rounded-xl border border-primary-dark bg-primary-gradient text-white hover:bg-primary-gradient-dark hover:border-primary hover:ring-2 hover:ring-primary/30 transition"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
