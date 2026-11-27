import { FiCheck, FiLoader, FiSave, FiX } from 'react-icons/fi'

type Props = {
  isDirty: boolean
  isSaving: boolean
  isSaved: boolean
  showsTick: boolean
  onDiscard: () => void
  onSave: () => void
}

const ROUND_ACTION =
  'flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-lg transition duration-200 ease-out hover:enabled:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none'
const SHOWN = 'scale-100 opacity-100'
const HIDDEN = 'pointer-events-none scale-75 opacity-0'

export default function PitchSaveActions({ isDirty, isSaving, isSaved, showsTick, onDiscard, onSave }: Props) {
  const canSave = isDirty && !isSaving
  const isVisible = isDirty || isSaved
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDiscard}
        disabled={!canSave}
        aria-hidden={!canSave}
        aria-label="Descartar cambios"
        title={canSave ? 'Descartar cambios' : undefined}
        className={`${ROUND_ACTION} ${canSave ? SHOWN : HIDDEN}`}
      >
        <FiX aria-hidden className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!isDirty}
        aria-disabled={isSaving}
        aria-hidden={!isVisible}
        aria-label="Guardar posiciones"
        title={canSave ? 'Guardar posiciones' : undefined}
        aria-busy={isSaving}
        className={`${ROUND_ACTION} ${isVisible ? SHOWN : HIDDEN}`}
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
