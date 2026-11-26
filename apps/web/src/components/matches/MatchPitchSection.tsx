'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapIcon } from '@heroicons/react/24/outline'
import type { Match, PitchPosition } from '@fulbito/types'
import { hasPitchChanges, resolveTeamPositions, withPitchPositions } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { FiAlertTriangle, FiCheck, FiLoader, FiSave, FiX } from 'react-icons/fi'
import ConfirmModal from '@/components/ConfirmModal'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'
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

const SAVED_VISIBLE_MS = 3000
const ROUND_ACTION =
  'flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-lg transition'

export default function MatchPitchSection({ match, editable, className = '' }: Props) {
  const updateMatchPositions = useMatchStore((state) => state.updateMatchPositions)
  const players = usePlayerStore((state) => state.players)
  const roleById = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.position])), [players])
  const [edits, setEdits] = useState<Record<string, PitchPosition>>({})
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [showsTick, setShowsTick] = useState(false)
  const goalkeeperIds = match.goalkeeperIds ?? []
  const teamA = withPitchPositions(match.teamA, edits)
  const teamB = withPitchPositions(match.teamB, edits)
  const originalPositions = {
    ...resolveTeamPositions(match.teamA, goalkeeperIds, 'A', roleById),
    ...resolveTeamPositions(match.teamB, goalkeeperIds, 'B', roleById),
  }
  const isDirty = hasPitchChanges(originalPositions, edits)
  const isSaving = status === 'saving'
  const isVisible = isDirty || status === 'saved'
  const canSave = isDirty && !isSaving
  const guard = useUnsavedChangesGuard(isDirty)

  useEffect(() => {
    if (status !== 'saved') return
    const timer = setTimeout(() => setStatus('idle'), SAVED_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [status])

  const movePlayer = (playerId: string, position: PitchPosition) => {
    setEdits((previous) => ({ ...previous, [playerId]: position }))
    setStatus('idle')
    setShowsTick(false)
  }

  const savePositions = async (): Promise<boolean> => {
    if (isSaving) return false
    setStatus('saving')
    try {
      await updateMatchPositions(match.id, {
        ...resolveTeamPositions(teamA, goalkeeperIds, 'A', roleById),
        ...resolveTeamPositions(teamB, goalkeeperIds, 'B', roleById),
      })
      setEdits({})
      setStatus('saved')
      setShowsTick(true)
      return true
    } catch {
      setStatus('error')
      return false
    }
  }

  const saveAndLeave = async () => {
    if (await savePositions()) guard.leave()
    else guard.stay()
  }

  const discardEdits = () => {
    setEdits({})
    setStatus('idle')
  }

  const discardAndLeave = () => {
    setEdits({})
    guard.leave()
  }

  return (
    <DetailSection
      id="match-pitch-title"
      title="Cancha"
      icon={MapIcon}
      headerClassName="max-sm:hidden"
      className={`max-sm:rounded-none max-sm:border-0 max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none ${className}`}
      description={
        editable ? 'Arrastrá las fichas, o enfocalas y usá las flechas, para reflejar dónde jugó cada uno' : undefined
      }
    >
      <PitchCanvas
        teamA={teamA}
        teamB={teamB}
        mvpId={match.mvpId}
        goalkeeperIds={goalkeeperIds}
        editable={editable}
        onPlayerMove={editable ? movePlayer : undefined}
        showMatchStats={match.status !== 'draft'}
        cornerAction={
          editable && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={discardEdits}
                disabled={!canSave}
                aria-hidden={!canSave}
                aria-label="Descartar cambios"
                title={canSave ? 'Descartar cambios' : undefined}
                className={`${ROUND_ACTION} duration-200 ease-out hover:enabled:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${canSave ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0'}`}
              >
                <FiX aria-hidden className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => void savePositions()}
                disabled={!isDirty}
                aria-disabled={isSaving}
                aria-hidden={!isVisible}
                aria-label="Guardar posiciones"
                title={canSave ? 'Guardar posiciones' : undefined}
                aria-busy={isSaving}
                className={`${ROUND_ACTION} duration-200 ease-out hover:enabled:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${isVisible ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0'}`}
              >
                {isSaving ? (
                  <FiLoader aria-hidden className="h-5 w-5 animate-spin" />
                ) : showsTick ? (
                  <FiCheck aria-hidden className="h-5 w-5" />
                ) : (
                  <FiSave aria-hidden className="h-5 w-5" />
                )}
              </button>
            </div>
          )
        }
        footer={
          editable && (
            <p aria-live="polite" className={status === 'error' ? 'text-right text-sm text-orange-700' : 'sr-only'}>
              {STATUS_TEXT[status]}
            </p>
          )
        }
      />
      <ConfirmModal
        open={guard.isBlocking}
        onClose={guard.stay}
        onConfirm={() => void saveAndLeave()}
        onCancel={discardAndLeave}
        busy={isSaving}
        title="Cambios sin guardar"
        icon={FiAlertTriangle}
        iconSize="large"
        confirmLabel={isSaving ? 'Guardando…' : 'Guardar cambios'}
        cancelLabel="Descartar cambios"
      >
        Moviste fichas en la cancha y no guardaste las posiciones.
      </ConfirmModal>
    </DetailSection>
  )
}
