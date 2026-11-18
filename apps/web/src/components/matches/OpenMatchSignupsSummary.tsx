'use client'

import { OPEN_MATCH_WAITLIST_SIZE } from '@fulbito/utils'
import type { OpenMatchController } from '@/hooks/use-open-match'
import OpenMatchSignupHint from './OpenMatchSignupHint'

type Props = {
  controller: OpenMatchController
  idPrefix: string
}

export default function OpenMatchSignupsSummary({ controller, idPrefix }: Props) {
  const { state } = controller
  if (!state) return null

  return (
    <>
      <p className="text-sm text-gray-700" aria-live="polite">
        <strong className="text-gray-900">
          {state.confirmed.length}/{state.capacity}
        </strong>{' '}
        confirmados · {state.waitlist.length}/{OPEN_MATCH_WAITLIST_SIZE} en lista de espera
      </p>
      <OpenMatchSignupHint controller={controller} idPrefix={idPrefix} className="mt-0.5 text-orange-700" />
    </>
  )
}
