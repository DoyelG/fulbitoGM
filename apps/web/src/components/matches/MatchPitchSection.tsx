'use client'

import { useMemo, useState } from 'react'
import { MapIcon } from '@heroicons/react/24/outline'
import type { Match, PitchPosition } from '@fulbito/types'
import { resolveTeamPositions, withPitchPositions } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import Button from '@/components/Button'
import DetailSection from '@/components/tournaments/detail/DetailSection'
import PitchCanvas from './PitchCanvas'

type Props = { match: Match; editable: boolean; className?: string }

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Guardando posiciones…',
  saved: 'Posiciones guardadas',
  error: 'No se pudieron guardar las posiciones',
}

export default function MatchPitchSection({ match, editable, className = '' }: Props) {
  const updateMatchPositions = useMatchStore((state) => state.updateMatchPositions)
  const players = usePlayerStore((state) => state.players)
  const roleById = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.position])), [players])
  const [edits, setEdits] = useState<Record<string, PitchPosition>>({})
  const [status, setStatus] = useState<SaveStatus>('idle')
  const goalkeeperIds = match.goalkeeperIds ?? []
  const teamA = withPitchPositions(match.teamA, edits)
  const teamB = withPitchPositions(match.teamB, edits)
  const isDirty = Object.keys(edits).length > 0

  const movePlayer = (playerId: string, position: PitchPosition) => {
    setEdits((previous) => ({ ...previous, [playerId]: position }))
    setStatus('idle')
  }

  const savePositions = async () => {
    setStatus('saving')
    try {
      await updateMatchPositions(match.id, {
        ...resolveTeamPositions(teamA, goalkeeperIds, 'A', roleById),
        ...resolveTeamPositions(teamB, goalkeeperIds, 'B', roleById),
      })
      setEdits({})
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  return (
    <DetailSection id="match-pitch-title" title="Cancha" icon={MapIcon} className={className}>
      <PitchCanvas
        teamA={teamA}
        teamB={teamB}
        mvpId={match.mvpId}
        goalkeeperIds={goalkeeperIds}
        editable={editable}
        onPlayerMove={editable ? movePlayer : undefined}
        showMatchStats={match.status !== 'draft'}
        hint={
          editable ? 'Arrastrá las fichas, o enfocalas y usá las flechas, para reflejar dónde jugó cada uno' : undefined
        }
        footer={
          editable && (
            <div className="flex flex-wrap items-center justify-end gap-3">
              <p aria-live="polite" className={`text-sm ${status === 'error' ? 'text-orange-700' : 'text-gray-600'}`}>
                {STATUS_TEXT[status]}
              </p>
              <Button onClick={savePositions} disabled={!isDirty || status === 'saving'}>
                Guardar posiciones
              </Button>
            </div>
          )
        }
      />
    </DetailSection>
  )
}
