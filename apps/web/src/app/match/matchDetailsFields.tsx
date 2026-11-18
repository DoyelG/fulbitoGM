'use client'

import type { MatchLocation } from '@fulbito/types'
import FriendlySwitch from '@/components/FriendlySwitch'
import HourField from '@/components/HourField'
import AddressPicker from '@/components/AddressPicker'
import { fieldClassName } from '@/lib/field-styles'

export type DraftForm = {
  date: string
  hour: number | null
  name: string
  location: MatchLocation | null
  description: string
}

type Props = {
  idPrefix: string
  draft: DraftForm
  onDraftChange: (changes: Partial<DraftForm>) => void
  isFriendly: boolean
  onFriendlyToggle: () => void
}

export default function MatchDetailsFields({ idPrefix, draft, onDraftChange, isFriendly, onFriendlyToggle }: Props) {
  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-date`} className="block text-sm mb-1">
          Fecha
        </label>
        <input
          id={`${idPrefix}-date`}
          type="date"
          value={draft.date}
          onChange={(event) => onDraftChange({ date: event.target.value })}
          className={fieldClassName}
        />
      </div>
      <HourField
        id={`${idPrefix}-hour`}
        value={draft.hour}
        onChange={(hour) => onDraftChange({ hour })}
        labelClassName="block text-sm"
      />
      <div>
        <label htmlFor={`${idPrefix}-location`} className="block text-sm mb-1">
          Cancha
        </label>
        <AddressPicker
          id={`${idPrefix}-location`}
          value={draft.location}
          onChange={(location) => onDraftChange({ location })}
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-name`} className="block text-sm mb-1">
          Nombre (opcional)
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={draft.name}
          onChange={(event) => onDraftChange({ name: event.target.value })}
          placeholder="Ej: Partido del miércoles"
          className={fieldClassName}
        />
      </div>
      <FriendlySwitch id={`${idPrefix}-friendly`} isFriendly={isFriendly} onToggle={onFriendlyToggle} />
    </>
  )
}
