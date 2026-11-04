'use client'

import { useState } from 'react'
import { InvitationError } from '@fulbito/firebase'
import type { InvitationRole, Player } from '@fulbito/types'
import Button from '@/components/Button'
import type { InvitationInput } from '@/store/useTournamentDetailStore'
import { ROLE_LABELS } from '../tournament-roles'

type Props = {
  availablePlayers: Player[]
  onSubmit: (input: InvitationInput) => Promise<void>
  onCancel: () => void
}

const fieldClassName = 'h-10 border rounded px-3 w-full bg-white focus:outline-none focus:ring-2 focus:ring-primary/50'
const invitationRoles: InvitationRole[] = ['MEMBER', 'ADMIN']

export default function InviteMemberForm({ availablePlayers, onSubmit, onCancel }: Props) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InvitationRole>('MEMBER')
  const [playerId, setPlayerId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ email, role, playerId: playerId || undefined })
    } catch (submitError) {
      setError(
        submitError instanceof InvitationError
          ? submitError.message
          : 'No se pudo enviar la invitación. Intentá de nuevo.',
      )
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <label htmlFor="invite-email" className="block text-sm font-medium mb-1">
        Email
      </label>
      <input
        id="invite-email"
        type="email"
        autoComplete="off"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'invite-form-error' : undefined}
        className={fieldClassName}
      />

      <label htmlFor="invite-role" className="block text-sm font-medium mb-1 mt-3">
        Rol
      </label>
      <select
        id="invite-role"
        value={role}
        onChange={(event) => setRole(event.target.value as InvitationRole)}
        className={fieldClassName}
      >
        {invitationRoles.map((option) => (
          <option key={option} value={option}>
            {ROLE_LABELS[option]}
          </option>
        ))}
      </select>

      <label htmlFor="invite-player" className="block text-sm font-medium mb-1 mt-3">
        Jugador <span className="font-normal text-gray-700">(opcional)</span>
      </label>
      <select
        id="invite-player"
        value={playerId}
        onChange={(event) => setPlayerId(event.target.value)}
        aria-describedby="invite-player-hint"
        className={fieldClassName}
      >
        <option value="">Sin jugador</option>
        {availablePlayers.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>
      <p id="invite-player-hint" className="mt-1 text-xs text-gray-700">
        Si no le asignás uno, va a poder pedirlo cuando entre al torneo.
      </p>

      {error && (
        <p id="invite-form-error" role="alert" className="mt-3 text-sm text-orange-700">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting || !email.trim()}>
          {submitting ? 'Enviando...' : 'Invitar'}
        </Button>
      </div>
    </form>
  )
}
