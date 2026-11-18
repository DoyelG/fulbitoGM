'use client'

import Link from 'next/link'
import { getOpenMatchAction, openMatchLockMessage, type OpenMatchAction } from '@fulbito/utils'
import type { OpenMatchController } from '@/hooks/use-open-match'
import { buttonClasses } from '@/components/Button'
import OpenMatchSignupHint, { openMatchSignupHintId } from './OpenMatchSignupHint'

type Tone = 'dark' | 'light'

type Props = {
  controller: OpenMatchController
  tone: Tone
  idPrefix: string
  showHint?: boolean
}

const DARK_BASE =
  'inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl px-6 py-3 font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

const DARK_STYLES: Record<OpenMatchAction['kind'], string> = {
  join: `${DARK_BASE} bg-secondary text-night shadow-lg shadow-secondary/35 enabled:hover:brightness-110`,
  leave: `${DARK_BASE} border border-white/60 text-white enabled:hover:bg-white/10`,
}

function actionClasses(tone: Tone, kind: OpenMatchAction['kind']): string {
  if (tone === 'dark') return DARK_STYLES[kind]
  return buttonClasses({ variant: kind === 'join' ? 'primary' : 'dangerousSecondary', className: 'whitespace-nowrap' })
}

export default function OpenMatchSignupButton({ controller, tone, idPrefix, showHint = true }: Props) {
  const { state, myPlayerId, pending, error, join, leave } = controller
  if (!state) return null

  const hintId = openMatchSignupHintId(idPrefix)
  const hintClass = `max-w-56 sm:text-right ${tone === 'dark' ? 'text-violet-100' : 'text-gray-700'}`
  const hint = showHint && <OpenMatchSignupHint controller={controller} idPrefix={idPrefix} className={hintClass} />

  if (!myPlayerId) {
    return (
      <div className="flex flex-col items-stretch gap-1 sm:items-end">
        <Link href="/profile" className={actionClasses(tone, 'join')} aria-describedby={hintId}>
          Vinculá tu jugador
        </Link>
        {hint}
      </div>
    )
  }

  const action = getOpenMatchAction(state)
  const hasMessage = Boolean(error ?? openMatchLockMessage(state.lockReason))

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <button
        type="button"
        onClick={action.kind === 'join' ? join : leave}
        disabled={!action.enabled || pending}
        aria-busy={pending}
        aria-describedby={hasMessage ? hintId : undefined}
        className={actionClasses(tone, action.kind)}
      >
        {pending ? 'Guardando…' : action.label}
      </button>
      {hint}
    </div>
  )
}
