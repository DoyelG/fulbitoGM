'use client'

import { MapIcon } from '@heroicons/react/24/outline'
import type { Match } from '@fulbito/types'
import { FiAlertTriangle } from 'react-icons/fi'
import ConfirmModal from '@/components/ConfirmModal'
import { usePitchEdits, type PitchSaveStatus } from '@/hooks/use-pitch-edits'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'
import DetailSection from '@/components/tournaments/detail/DetailSection'
import PitchCanvas from './PitchCanvas'
import PitchSaveActions from './PitchSaveActions'

type Props = { match: Match; editable: boolean; className?: string }

const STATUS_TEXT: Record<PitchSaveStatus, string> = {
  idle: '',
  saving: 'Guardando posiciones…',
  saved: 'Posiciones guardadas',
  error: 'No se pudieron guardar las posiciones',
}

export default function MatchPitchSection({ match, editable, className = '' }: Props) {
  const pitch = usePitchEdits(match)
  const isSaving = pitch.status === 'saving'
  const guard = useUnsavedChangesGuard(pitch.isDirty)

  const saveAndLeave = async () => {
    if (await pitch.save()) guard.leave()
    else guard.stay()
  }

  const discardAndLeave = () => {
    pitch.discard()
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
        teamA={pitch.teamA}
        teamB={pitch.teamB}
        mvpId={match.mvpId}
        goalkeeperIds={pitch.goalkeeperIds}
        editable={editable}
        onPlayerMove={editable ? pitch.move : undefined}
        showMatchStats={match.status !== 'draft'}
        showTooltips={!pitch.isDirty}
        cornerAction={
          editable && (
            <PitchSaveActions
              isDirty={pitch.isDirty}
              isSaving={isSaving}
              isSaved={pitch.status === 'saved'}
              showsTick={pitch.showsTick}
              onDiscard={pitch.discard}
              onSave={() => void pitch.save()}
            />
          )
        }
        footer={
          editable && (
            <p
              aria-live="polite"
              className={pitch.status === 'error' ? 'text-right text-sm text-orange-700' : 'sr-only'}
            >
              {STATUS_TEXT[pitch.status]}
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
