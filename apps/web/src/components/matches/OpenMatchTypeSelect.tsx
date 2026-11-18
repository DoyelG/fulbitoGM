'use client'

import { canResizeOpenMatch, MATCH_TYPES } from '@fulbito/utils'
import Chevron from '@/app/shared/Icons/Chevron'
import { selectClassName } from '@/lib/field-styles'
import type { OpenMatchController } from '@/hooks/use-open-match'

type Props = {
  controller: OpenMatchController
}

export default function OpenMatchTypeSelect({ controller }: Props) {
  const { match, pending, changeType } = controller
  if (!match) return null
  const signupCount = match.signups?.length ?? 0

  return (
    <div className="relative">
      <label htmlFor="open-match-type" className="sr-only">
        Modo de partido
      </label>
      <select
        id="open-match-type"
        value={match.type}
        disabled={pending}
        onChange={(event) => {
          const next = MATCH_TYPES.find((option) => option === event.target.value)
          if (next && next !== match.type) void changeType(next)
        }}
        className={`${selectClassName} cursor-pointer`}
      >
        {MATCH_TYPES.map((option) => (
          <option key={option} value={option} disabled={!canResizeOpenMatch(signupCount, option)}>
            {option}
          </option>
        ))}
      </select>
      <Chevron select />
    </div>
  )
}
