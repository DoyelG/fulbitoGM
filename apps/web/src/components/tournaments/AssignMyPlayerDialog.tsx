'use client'

import { useEffect, useState } from 'react'
import { getPlayers, getTournamentMembers } from '@fulbito/firebase'
import type { MyTournament, Player } from '@fulbito/types'
import { getAssignablePlayers } from '@fulbito/utils'
import Modal from '@/components/Modal'
import { useTournamentStore } from '@/store/useTournamentStore'
import AssignPlayerForm from './members/AssignPlayerForm'

type Props = {
  item: MyTournament
  onClose: () => void
}

type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'loaded'; players: Player[] }

export default function AssignMyPlayerDialog({ item, onClose }: Props) {
  const assignMyPlayer = useTournamentStore((state) => state.assignMyPlayer)
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const { tournament, membership } = item

  useEffect(() => {
    let isCurrent = true
    Promise.all([getPlayers(tournament.id), getTournamentMembers(tournament.id)])
      .then(([players, members]) => {
        if (isCurrent) setState({ status: 'loaded', players: getAssignablePlayers(players, members, membership) })
      })
      .catch(() => {
        if (isCurrent) setState({ status: 'error' })
      })
    return () => {
      isCurrent = false
    }
  }, [tournament.id, membership])

  const handleSubmit = async (playerId: string | null) => {
    await assignMyPlayer(tournament.id, playerId)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Elegir mi jugador">
      {state.status === 'loading' && (
        <p role="status" className="text-sm text-gray-700">
          Cargando jugadores...
        </p>
      )}
      {state.status === 'error' && (
        <p role="alert" className="text-sm text-red-700">
          No se pudieron cargar los jugadores. Intentá de nuevo.
        </p>
      )}
      {state.status === 'loaded' && (
        <AssignPlayerForm
          member={membership}
          availablePlayers={state.players}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSelf
        />
      )}
    </Modal>
  )
}
