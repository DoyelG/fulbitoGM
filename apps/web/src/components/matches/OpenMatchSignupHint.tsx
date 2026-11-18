'use client'

import { openMatchLockMessage } from '@fulbito/utils'
import type { OpenMatchController } from '@/hooks/use-open-match'

type Props = {
  controller: OpenMatchController
  idPrefix: string
  className?: string
}

export const LINK_PLAYER_HINT = 'Para inscribirte tenés que tener un jugador vinculado en este torneo.'

export function openMatchSignupHintId(idPrefix: string): string {
  return `${idPrefix}-signup-hint`
}

export default function OpenMatchSignupHint({ controller, idPrefix, className = '' }: Props) {
  const { state, myPlayerId, error } = controller
  if (!state) return null
  const message = myPlayerId ? (error ?? openMatchLockMessage(state.lockReason)) : LINK_PLAYER_HINT

  return (
    <p id={openMatchSignupHintId(idPrefix)} aria-live="polite" className={`text-xs ${className}`}>
      {message}
    </p>
  )
}
