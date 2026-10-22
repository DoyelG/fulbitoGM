'use client'

import Link from 'next/link'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { calculateAllCurrentStreaks } from '@/lib/playerStats'
import { onlyFinalMatches } from '@fulbito/utils'
import type { Match, Player } from '@fulbito/types'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { FiUserCheck, FiUserX, FiTrash2 } from 'react-icons/fi'
import PlayersTable, { type PlayerRow } from './PlayersTable'
import ConfirmModal from '@/components/ConfirmModal'
import PageTitle from '@/components/PageTitle'
import { buttonClasses } from '@/components/Button'
import Chevron from '../shared/Icons/Chevron'

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
      <PageTitle
        spacing={8}
        actions={
          isAdmin && (
            <Link href="/players/new" className={buttonClasses()}>
              Agregar jugador
            </Link>
          )
        }
      >
        Jugadores
      </PageTitle>

      <div className="mb-6">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar por nombre..."
          aria-label="Buscar jugador por nombre"
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
            onClick={() => setShowInactiveTable((isShown) => !isShown)}
            aria-expanded={showInactiveTable}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <h2 className="text-lg font-semibold text-gray-800">Inactivos</h2>
            <Chevron direction={showInactiveTable ? 'up' : 'down'} className="h-5 w-5 text-gray-500" />
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

      <ConfirmModal
        title="Confirmar eliminación"
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmDelete}
        icon={FiTrash2}
        tone="danger"
        confirmLabel="Eliminar"
      >
        <p>
          ¿Estás seguro de que querés eliminar a{' '}
          <span className="font-medium text-gray-900">{selectedPlayer?.name}</span>?
        </p>
      </ConfirmModal>

      <ConfirmModal
        title="Confirmar cambio de estado"
        open={showToggleModal}
        onClose={() => setShowToggleModal(false)}
        onConfirm={handleConfirmToggle}
        icon={toggleTarget?.inactive ? FiUserX : FiUserCheck}
        tone={toggleTarget?.inactive ? 'danger' : 'brand'}
        confirmVariant="primary"
      >
        <p>
          ¿Estás seguro de que querés {toggleTarget?.inactive ? 'desactivar' : 'activar'} a{' '}
          <span className="font-medium text-gray-900">{toggleTargetPlayer?.name}</span>?
        </p>
      </ConfirmModal>
    </div>
  )
}
