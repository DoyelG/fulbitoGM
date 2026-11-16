'use client'

import type { ComponentType } from 'react'
import { FiMail, FiSlash, FiUsers } from 'react-icons/fi'
import type { TournamentMember } from '@fulbito/types'
import type { PlayerLink } from '@/store/usePlayerStore'
import FormSection from './FormSection'

type Props = {
  value: PlayerLink
  onChange: (link: PlayerLink) => void
  members: TournamentMember[]
  currentUid?: string | null
  emailError: string | null
}

type Option = {
  kind: PlayerLink['kind']
  label: string
  description: string
  icon: ComponentType<{ 'aria-hidden'?: boolean; size?: number }>
}

const options: Option[] = [
  { kind: 'none', label: 'Sin vincular', description: 'Lo podés vincular más adelante.', icon: FiSlash },
  { kind: 'member', label: 'Miembro del torneo', description: 'Alguien que ya está en el torneo.', icon: FiUsers },
  { kind: 'invite', label: 'Invitar por email', description: 'Lo sumás al torneo con este jugador.', icon: FiMail },
]

const fieldClassName =
  'mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40'

export default function PlayerLinkSection({ value, onChange, members, currentUid = null, emailError }: Props) {
  const linkableMembers = members.filter((member) => !member.playerId || member.uid === currentUid)

  const select = (kind: PlayerLink['kind']) => {
    if (kind === value.kind) return
    if (kind === 'none') onChange({ kind })
    if (kind === 'member') onChange({ kind, uid: currentUid ?? linkableMembers[0]?.uid ?? '' })
    if (kind === 'invite') onChange({ kind, email: '' })
  }

  return (
    <FormSection
      id="player-link-title"
      title="Vincular con una persona"
      description="La persona vinculada puede editar el nombre, la foto y la posición de este jugador, y subir sus clips."
    >
      <fieldset>
        <legend className="sr-only">Con quién vincular al jugador</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {options.map(({ kind, label, description, icon: Icon }) => {
            const selected = value.kind === kind
            return (
              <label
                key={kind}
                className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50 ${
                  selected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name="player-link"
                  value={kind}
                  checked={selected}
                  onChange={() => select(kind)}
                  className="sr-only"
                />
                <span
                  className={`flex items-center gap-2 text-sm font-semibold ${selected ? 'text-primary' : 'text-gray-900'}`}
                >
                  <Icon aria-hidden size={16} />
                  {label}
                </span>
                <span className="text-xs text-gray-700">{description}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {value.kind === 'member' && (
        <div className="mt-4">
          {linkableMembers.length > 0 ? (
            <>
              <label htmlFor="player-link-member" className="block text-sm font-medium text-gray-900">
                Persona
              </label>
              <select
                id="player-link-member"
                value={value.uid}
                onChange={(event) => onChange({ kind: 'member', uid: event.target.value })}
                className={fieldClassName}
              >
                {linkableMembers.map((member) => (
                  <option key={member.uid} value={member.uid}>
                    {member.email}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <p role="status" className="rounded-md bg-gray-50 p-3 text-sm text-gray-800">
              Todos los miembros del torneo ya tienen un jugador. Podés invitar a alguien por email.
            </p>
          )}
        </div>
      )}

      {value.kind === 'invite' && (
        <div className="mt-4">
          <label htmlFor="player-link-email" className="block text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            id="player-link-email"
            type="email"
            autoComplete="off"
            placeholder="nombre@ejemplo.com"
            value={value.email}
            onChange={(event) => onChange({ kind: 'invite', email: event.target.value })}
            aria-invalid={Boolean(emailError)}
            aria-describedby="player-link-email-hint"
            className={fieldClassName}
          />
          <p id="player-link-email-hint" className={`mt-1 text-xs ${emailError ? 'text-orange-700' : 'text-gray-700'}`}>
            {emailError ??
              'Va a ver la invitación al entrar con ese email, y al aceptarla queda vinculado a este jugador.'}
          </p>
        </div>
      )}
    </FormSection>
  )
}
