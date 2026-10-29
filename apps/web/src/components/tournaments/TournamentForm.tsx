'use client'

import { useState, type FormEvent } from 'react'
import Button from '@/components/Button'
import type { TournamentInput } from '@/store/useTournamentStore'
import TournamentPhotoField from './TournamentPhotoField'

const MAX_NAME_LENGTH = 60
const MAX_DESCRIPTION_LENGTH = 280

type Props = {
  initial?: TournamentInput
  initialPhotoUrl?: string
  submitLabel: string
  submittingLabel: string
  errorMessage: string
  onCancel: () => void
  onSubmit: (data: TournamentInput) => Promise<void>
}

export default function TournamentForm({
  initial,
  initialPhotoUrl,
  submitLabel,
  submittingLabel,
  errorMessage,
  onCancel,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [photoFile, setPhotoFile] = useState<File | null | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('El nombre del torneo es obligatorio')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ name, description, photoFile })
    } catch {
      setError(errorMessage)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <label htmlFor="tournament-name" className="block text-sm font-medium mb-1">
        Nombre
      </label>
      <input
        id="tournament-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={MAX_NAME_LENGTH}
        placeholder="Ej: Fulbito de los jueves"
        aria-invalid={Boolean(error) && !name.trim()}
        aria-describedby={error ? 'tournament-form-error' : undefined}
        className="h-10 border rounded px-3 w-full focus:outline-none focus:ring-2 focus:ring-brand/50"
        autoFocus
      />

      <label htmlFor="tournament-description" className="block text-sm font-medium mb-1 mt-3">
        Descripción <span className="font-normal text-gray-700">(opcional)</span>
      </label>
      <textarea
        id="tournament-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength={MAX_DESCRIPTION_LENGTH}
        rows={3}
        placeholder="Dónde y cuándo juegan, reglas, etc."
        className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand/50"
      />

      <div className="mt-3">
        <TournamentPhotoField currentUrl={initialPhotoUrl} value={photoFile} onChange={setPhotoFile} />
      </div>

      {error && (
        <p id="tournament-form-error" role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}
