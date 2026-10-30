'use client'

import { useState, type FormEvent } from 'react'
import { TournamentMemberError } from '@fulbito/firebase'
import type { InvitationRole, TournamentMember } from '@fulbito/types'
import Button from '@/components/Button'
import { ROLE_LABELS } from '../tournament-roles'

type Props = {
  member: TournamentMember
  onSubmit: (role: InvitationRole) => Promise<void>
  onCancel: () => void
}

const assignableRoles: InvitationRole[] = ['MEMBER', 'ADMIN']

const ROLE_HINTS: Record<InvitationRole, string> = {
  MEMBER: 'Ve todo el torneo y edita solo su jugador.',
  ADMIN: 'Gestiona jugadores, partidos, invitaciones y miembros.',
}

export default function ChangeRoleForm({ member, onSubmit, onCancel }: Props) {
  const [role, setRole] = useState<InvitationRole>(member.role === 'ADMIN' ? 'ADMIN' : 'MEMBER')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(role)
    } catch (submitError) {
      setError(
        submitError instanceof TournamentMemberError
          ? submitError.message
          : 'No se pudo cambiar el rol. Intentá de nuevo.',
      )
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={submitting}>
      <p className="mb-3 text-sm text-gray-800">
        Elegí el rol de <span className="font-medium">{member.email}</span> en este torneo.
      </p>
      <label htmlFor="change-role" className="mb-1 block text-sm font-medium">
        Rol
      </label>
      <select
        id="change-role"
        value={role}
        onChange={(event) => setRole(event.target.value as InvitationRole)}
        aria-describedby={error ? 'change-role-hint change-role-error' : 'change-role-hint'}
        className="h-10 w-full rounded border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-brand/50"
      >
        {assignableRoles.map((option) => (
          <option key={option} value={option}>
            {ROLE_LABELS[option]}
          </option>
        ))}
      </select>
      <p id="change-role-hint" className="mt-2 text-sm text-gray-700">
        {ROLE_HINTS[role]}
      </p>

      {error && (
        <p id="change-role-error" role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting || role === member.role}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
