'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MatchType } from '@fulbito/types'
import { buildMatchSchedule, buildOpenMatchStartsAt, OPEN_MATCH_WAITLIST_SIZE, playersPerTeam } from '@fulbito/utils'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'
import { Card } from '@/components/Card'
import Button from '@/components/Button'
import MatchDetailsFields, { type DraftForm } from './matchDetailsFields'

type Props = {
  matchType: MatchType
  draft: DraftForm
  onDraftChange: (changes: Partial<DraftForm>) => void
  isFriendly: boolean
  onFriendlyToggle: () => void
}

function validate(draft: DraftForm): string | null {
  if (!draft.date) return 'Elegí la fecha del partido.'
  if (draft.hour === null) return 'Elegí la hora: desde 24 hs antes ya nadie puede bajarse.'
  if (new Date(buildOpenMatchStartsAt(draft.date, draft.hour)).getTime() <= Date.now()) {
    return 'El partido tiene que ser en el futuro.'
  }
  return null
}

export default function OpenMatchForm({ matchType, draft, onDraftChange, isFriendly, onFriendlyToggle }: Props) {
  const router = useRouter()
  const addOpenMatch = useMatchStore((state) => state.addOpenMatch)
  const { user } = useFirebaseAuth()
  const linkedPlayerId = useTournamentStore(selectActiveTournament)?.membership.playerId ?? null
  const linkedName = usePlayerStore((state) => state.players.find((player) => player.id === linkedPlayerId)?.name)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const capacity = playersPerTeam(matchType) * 2

  const create = async () => {
    if (isCreating) return
    const validationError = validate(draft)
    setError(validationError)
    if (validationError || draft.hour === null || !user) return
    setIsCreating(true)
    try {
      const author = { uid: user.uid, name: linkedName || (user.email ?? '').split('@')[0] || 'Admin' }
      const matchId = await addOpenMatch(
        {
          ...buildMatchSchedule(draft.date, draft.hour),
          startsAt: buildOpenMatchStartsAt(draft.date, draft.hour),
          type: matchType,
          name: draft.name.trim() || undefined,
          description: draft.description.trim() || undefined,
          location: draft.location,
          isFriendly,
        },
        author,
      )
      router.push(`/history/${matchId}`)
    } catch {
      setError('No se pudo crear el partido. Probá de nuevo.')
      setIsCreating(false)
    }
  }

  return (
    <Card className="mt-6">
      <h2 className="font-semibold mb-3">Crear partido abierto</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-end lg:grid-cols-[auto_auto_minmax(0,2fr)_minmax(0,1.5fr)_auto_auto]">
        <MatchDetailsFields
          idPrefix="open"
          draft={draft}
          onDraftChange={(changes) => {
            setError(null)
            onDraftChange(changes)
          }}
          isFriendly={isFriendly}
          onFriendlyToggle={onFriendlyToggle}
        />
        <Button
          onClick={create}
          disabled={isCreating}
          aria-busy={isCreating}
          aria-describedby={error ? 'open-match-error' : 'open-match-hint'}
          className="h-10 w-full sm:col-span-2 lg:col-span-1 lg:w-auto whitespace-nowrap"
        >
          {isCreating ? 'Creando...' : 'Crear partido abierto'}
        </Button>
      </div>
      <p id="open-match-hint" className="mt-2 text-xs text-gray-600">
        Los jugadores del torneo se van a poder inscribir hasta completar {capacity} lugares, más{' '}
        {OPEN_MATCH_WAITLIST_SIZE} en lista de espera.
      </p>
      <p id="open-match-error" role="alert" aria-live="polite" className="mt-1 text-sm text-orange-700">
        {error}
      </p>
    </Card>
  )
}
