'use client'

import { useState } from 'react'
import { UserPlusIcon } from '@heroicons/react/24/outline'
import type { TournamentPlayerRequest } from '@fulbito/types'
import { TournamentPlayerRequestError } from '@fulbito/firebase'
import Button from '@/components/Button'
import DetailSection from './DetailSection'

type Props = {
  requests: TournamentPlayerRequest[]
  playerNameById: Map<string, string>
  onResolve: (uid: string, action: 'accepted' | 'rejected') => Promise<void>
}

export default function PlayerRequestsPanel({ requests, playerNameById, onResolve }: Props) {
  const [resolvingUid, setResolvingUid] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (requests.length === 0) return null

  const resolve = async (uid: string, action: 'accepted' | 'rejected') => {
    setResolvingUid(uid)
    setErrorMessage(null)
    try {
      await onResolve(uid, action)
    } catch (error) {
      setErrorMessage(
        error instanceof TournamentPlayerRequestError
          ? error.message
          : 'No se pudo resolver la solicitud. Probá de nuevo más tarde.',
      )
    } finally {
      setResolvingUid(null)
    }
  }

  return (
    <DetailSection id="player-requests-title" title="Solicitudes de jugador" icon={UserPlusIcon}>
      <ul className="space-y-4">
        {requests.map((request) => {
          const playerLabel = request.playerId
            ? (playerNameById.get(request.playerId) ?? 'Jugador desconocido')
            : `Jugador nuevo: ${request.newPlayerName}`
          const isResolving = resolvingUid === request.uid
          return (
            <li key={request.uid} className="space-y-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{request.email}</p>
                <p className="truncate text-xs text-gray-700">{playerLabel}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  block
                  disabled={resolvingUid !== null}
                  onClick={() => resolve(request.uid, 'rejected')}
                  aria-label={`Rechazar la solicitud de ${request.email}`}
                >
                  Rechazar
                </Button>
                <Button
                  type="button"
                  block
                  disabled={resolvingUid !== null}
                  aria-busy={isResolving}
                  onClick={() => resolve(request.uid, 'accepted')}
                  aria-label={`Aceptar la solicitud de ${request.email}`}
                >
                  Aceptar
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-orange-700">
          {errorMessage}
        </p>
      )}
    </DetailSection>
  )
}
