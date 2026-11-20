'use client'

import { useState, type FormEvent } from 'react'
import Button from '@/components/Button'
import { fieldClassName } from '@/lib/field-styles'

const MAX_NAME_LENGTH = 50

type Props = {
  onCancel: () => void
  onSubmit: (playerName: string) => Promise<void>
}

export default function PersonalTournamentForm({ onCancel, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Tu nombre de jugador es obligatorio')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(name.trim())
    } catch {
      setError('No se pudo crear tu historia personal. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <p className="mb-4 text-sm text-gray-700">
        Tu historia personal es un torneo solo para vos: cargás tus propios partidos, goles y clips, y seguís tu
        objetivo de Mundial. Podés tener una sola.
      </p>
      <label htmlFor="personal-player-name" className="block text-sm font-medium mb-1">
        Tu nombre de jugador
      </label>
      <input
        id="personal-player-name"
        value={name}
        maxLength={MAX_NAME_LENGTH}
        onChange={(event) => setName(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'personal-player-name-error' : undefined}
        className={fieldClassName}
      />
      {error && (
        <p id="personal-player-name-error" role="alert" className="mt-2 text-sm text-orange-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear mi historia'}
        </Button>
      </div>
    </form>
  )
}
