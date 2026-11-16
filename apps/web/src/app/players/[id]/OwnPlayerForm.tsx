'use client'

import { useState, type FormEvent } from 'react'
import type { Player } from '@fulbito/types'
import { positionOptions } from '@fulbito/utils'
import Button from '@/components/Button'
import { usePlayerStore } from '@/store/usePlayerStore'
import OwnPlayerPhotoUpload from '@/app/players/[id]/OwnPlayerPhotoUpload'

const NAME_MAX_LENGTH = 40

const fieldClassName =
  'mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40'

type SaveState = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; message: string }

export default function OwnPlayerForm({ player }: { player: Player }) {
  const updatePlayer = usePlayerStore((state) => state.updatePlayer)
  const [name, setName] = useState(player.name)
  const [position, setPosition] = useState(player.position)
  const [saveState, setSaveState] = useState<SaveState>({ kind: 'idle' })

  const trimmedName = name.trim()
  const hasChanges = trimmedName !== player.name || position !== player.position
  const canSubmit = trimmedName.length > 0 && hasChanges && saveState.kind !== 'saving'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    setSaveState({ kind: 'saving' })
    try {
      await updatePlayer(player.id, { name: trimmedName, position })
      setSaveState({ kind: 'saved' })
    } catch {
      setSaveState({ kind: 'error', message: 'No se pudieron guardar los cambios. Probá de nuevo.' })
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-3" aria-busy={saveState.kind === 'saving'}>
      <h3 className="text-sm font-semibold text-gray-900">Tu jugador</h3>
      <OwnPlayerPhotoUpload player={player} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="own-player-name" className="block text-sm font-medium text-gray-900">
            Nombre
          </label>
          <input
            id="own-player-name"
            type="text"
            required
            maxLength={NAME_MAX_LENGTH}
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setSaveState({ kind: 'idle' })
            }}
            aria-describedby={saveState.kind === 'error' ? 'own-player-error' : undefined}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="own-player-position" className="block text-sm font-medium text-gray-900">
            Posición
          </label>
          <select
            id="own-player-position"
            value={position}
            onChange={(event) => {
              setPosition(event.target.value)
              setSaveState({ kind: 'idle' })
            }}
            aria-describedby={saveState.kind === 'error' ? 'own-player-error' : undefined}
            className={fieldClassName}
          >
            {positionOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <p aria-live="polite" className="text-sm">
          {saveState.kind === 'saved' && <span className="text-gray-700">Cambios guardados.</span>}
          {saveState.kind === 'error' && (
            <span id="own-player-error" role="alert" className="text-orange-700">
              {saveState.message}
            </span>
          )}
        </p>
        <Button type="submit" variant="primary" size="md" disabled={!canSubmit}>
          {saveState.kind === 'saving' ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
