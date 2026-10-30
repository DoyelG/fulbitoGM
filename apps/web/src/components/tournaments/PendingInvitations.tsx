'use client'

import { useCallback, useEffect, useState } from 'react'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import { acceptInvitation, getMyInvitations, InvitationError, rejectInvitation, type AppUser } from '@fulbito/firebase'
import type { Invitation } from '@fulbito/types'
import Button from '@/components/Button'
import { useTournamentStore } from '@/store/useTournamentStore'
import { ROLE_LABELS } from './tournament-roles'

export default function PendingInvitations({ user }: { user: AppUser }) {
  const loadMyTournaments = useTournamentStore((state) => state.loadMyTournaments)
  const setActiveTournament = useTournamentStore((state) => state.setActiveTournament)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadInvitations = useCallback(async () => {
    try {
      setInvitations(await getMyInvitations(user.email))
    } catch {
      setErrorMessage('No se pudieron cargar tus invitaciones.')
    }
  }, [user.email])

  useEffect(() => {
    void loadInvitations()
  }, [loadInvitations])

  const respond = async (invitation: Invitation, action: 'accept' | 'reject') => {
    setRespondingId(invitation.id)
    setErrorMessage(null)
    try {
      if (action === 'accept') {
        await acceptInvitation(invitation.id, user)
        await loadMyTournaments(user.uid)
        if (!useTournamentStore.getState().activeTournamentId) setActiveTournament(invitation.tournamentId)
      } else {
        await rejectInvitation(invitation.id, user.email)
      }
      await loadInvitations()
    } catch (error) {
      setErrorMessage(
        error instanceof InvitationError ? error.message : 'No se pudo responder la invitación. Intentá de nuevo.',
      )
    } finally {
      setRespondingId(null)
    }
  }

  if (invitations.length === 0 && !errorMessage) return null

  return (
    <section aria-labelledby="pending-invitations-title" className="mb-8">
      <h2 id="pending-invitations-title" className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <EnvelopeIcon className="h-5 w-5 text-brand" aria-hidden />
        Invitaciones pendientes
      </h2>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {invitations.map((invitation) => (
          <li
            key={invitation.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-brand/30 bg-brand/5 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">{invitation.tournamentName}</p>
              <p className="text-sm text-gray-700">Te invitaron como {ROLE_LABELS[invitation.role].toLowerCase()}</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={respondingId !== null}
                aria-label={`Rechazar la invitación a ${invitation.tournamentName}`}
                onClick={() => respond(invitation, 'reject')}
              >
                Rechazar
              </Button>
              <Button
                type="button"
                disabled={respondingId !== null}
                aria-busy={respondingId === invitation.id}
                aria-label={`Aceptar la invitación a ${invitation.tournamentName}`}
                onClick={() => respond(invitation, 'accept')}
              >
                Aceptar
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </section>
  )
}
