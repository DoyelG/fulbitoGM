'use client'

import { useState, type FormEvent } from 'react'
import { TournamentMemberError } from '@fulbito/firebase'
import type { Player, TournamentMember } from '@fulbito/types'
import Button from '@/components/Button'

type Props = {
  member: TournamentMember
  availablePlayers: Player[]
  onSubmit: (playerId: string | null) => Promise<void>
  onCancel: () => void
  isSelf?: boolean
}

export default function AssignPlayerForm({ member, availablePlayers, onSubmit, onCancel, isSelf = false }: Props) {
  const [playerId, setPlayerId] = useState(member.playerId ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(playerId || null)
    } catch (submitError) {
      setError(
        submitError instanceof TournamentMemberError
          ? submitError.message
          : 'No se pudo cambiar el jugador. Intentá de nuevo.',
      )
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={submitting}>
      <p className="mb-3 text-sm text-gray-800">
        {isSelf ? (
          'Elegí tu jugador en este torneo.'
        ) : (
          <>
            Elegí el jugador de <span className="font-medium">{member.email}</span> en este torneo.
          </>
        )}
      </p>
      <label htmlFor="assign-player" className="mb-1 block text-sm font-medium">
        Jugador
      </label>
      <select
        id="assign-player"
        value={playerId}
        onChange={(event) => setPlayerId(event.target.value)}
        aria-describedby={error ? 'assign-player-error' : undefined}
        className="h-10 w-full rounded border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">Sin jugador</option>
        {availablePlayers.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>

      {error && (
        <p id="assign-player-error" role="alert" className="mt-3 text-sm text-orange-700">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting || playerId === (member.playerId ?? '')}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
