'use client'

import { useState } from 'react'
import { EnvelopeIcon, PlusIcon } from '@heroicons/react/24/outline'
import type { Invitation, Player } from '@fulbito/types'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import type { InvitationInput } from '@/store/useTournamentDetailStore'
import { ROLE_LABELS } from '../tournament-roles'
import DetailSection from './DetailSection'
import InviteMemberForm from './InviteMemberForm'

type Props = {
  invitations: Invitation[]
  availablePlayers: Player[]
  playerNameById: Map<string, string>
  onInvite: (input: InvitationInput) => Promise<void>
  onRevoke: (invitationId: string) => Promise<void>
}

export default function InvitationsPanel({ invitations, availablePlayers, playerNameById, onInvite, onRevoke }: Props) {
  const [inviting, setInviting] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleInvite = async (input: InvitationInput) => {
    await onInvite(input)
    setInviting(false)
  }

  const handleRevoke = async (invitationId: string) => {
    setRevokingId(invitationId)
    setErrorMessage(null)
    try {
      await onRevoke(invitationId)
    } catch {
      setErrorMessage('No se pudo revocar la invitación. Intentá de nuevo.')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <DetailSection id="invitations-title" title="Invitaciones" icon={EnvelopeIcon}>
      {invitations.length === 0 ? (
        <p className="text-sm text-gray-700">No hay invitaciones pendientes.</p>
      ) : (
        <ul className="space-y-3">
          {invitations.map((invitation) => {
            const playerName = invitation.playerId ? playerNameById.get(invitation.playerId) : undefined
            return (
              <li key={invitation.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{invitation.email}</p>
                  <p className="truncate text-xs text-gray-700">
                    {ROLE_LABELS[invitation.role]}
                    {playerName && ` · ${playerName}`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="dangerousSecondary"
                  disabled={revokingId !== null}
                  aria-busy={revokingId === invitation.id}
                  aria-label={`Revocar la invitación de ${invitation.email}`}
                  onClick={() => handleRevoke(invitation.id)}
                >
                  Revocar
                </Button>
              </li>
            )
          })}
        </ul>
      )}
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-orange-700">
          {errorMessage}
        </p>
      )}
      <Button
        type="button"
        variant="secondary"
        className="mt-4 w-full items-center justify-center gap-2"
        onClick={() => setInviting(true)}
      >
        <PlusIcon className="h-5 w-5" aria-hidden />
        Invitar
      </Button>

      <Modal open={inviting} onClose={() => setInviting(false)} title="Invitar al torneo">
        {inviting && (
          <InviteMemberForm
            availablePlayers={availablePlayers}
            onSubmit={handleInvite}
            onCancel={() => setInviting(false)}
          />
        )}
      </Modal>
    </DetailSection>
  )
}
