'use client'

import type { MatchType } from '@fulbito/types'
import { Card } from '@/components/Card'
import Chevron from '../shared/Icons/Chevron'
import { selectClassName } from '@/lib/field-styles'

type Props = {
  value: MatchType | null
  options: readonly MatchType[]
  onChange: (value: MatchType | null) => void
}

export function MatchTypeSelect({ value, options, onChange }: Props) {
  return (
    <Card className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center z-3 relative">
      <label htmlFor="match-type" className="font-medium">
        Modo de partido
      </label>
      <div className="relative w-full sm:w-auto">
        <select
          autoFocus={value === null}
          id="match-type"
          name="match-type"
          value={value ?? ''}
          onChange={(event) => {
            const selectedType = options.find((option) => option === event.target.value)
            onChange(selectedType ?? null)
          }}
          className={`${selectClassName} cursor-pointer`}
        >
          <option hidden value="">
            -
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Chevron select />
      </div>
    </Card>
  )
}
