'use client'

import type { Convocatoria } from '@fulbito/utils'
import Chevron from '../shared/Icons/Chevron'
import { selectClassName } from '@/lib/field-styles'

type Props = {
  value: Convocatoria
  onChange: (value: Convocatoria) => void
}

const OPTIONS: { value: Convocatoria; label: string }[] = [
  { value: 'preselected', label: 'Jugadores preseleccionados' },
  { value: 'open', label: 'Partido abierto' },
]

export default function ConvocatoriaSelect({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <label htmlFor="match-convocatoria" className="font-medium">
        Convocatoria
      </label>
      <div className="relative w-full sm:w-auto">
        <select
          id="match-convocatoria"
          name="match-convocatoria"
          value={value}
          aria-describedby="match-convocatoria-hint"
          onChange={(event) => {
            const option = OPTIONS.find((candidate) => candidate.value === event.target.value)
            if (option) onChange(option.value)
          }}
          className={`${selectClassName} cursor-pointer`}
        >
          {OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Chevron select />
      </div>
      <p id="match-convocatoria-hint" className="text-xs text-gray-600 sm:max-w-xs">
        {value === 'open'
          ? 'Los jugadores del torneo se anotan solos desde la app.'
          : 'Elegís vos los jugadores y armás los equipos ahora.'}
      </p>
    </div>
  )
}
