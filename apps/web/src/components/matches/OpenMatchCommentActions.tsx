'use client'

import Link from 'next/link'
import { getOpenMatchAction } from '@fulbito/utils'
import Button, { buttonClasses } from '@/components/Button'
import { useMatchById, useOpenMatch } from '@/hooks/use-open-match'

type Props = {
  matchId: string
}

const SIGNED_UP_LABEL = {
  confirmed: 'Ya estás anotado',
  waitlist: 'Estás en la lista de espera',
} as const

export default function OpenMatchCommentActions({ matchId }: Props) {
  const { state, myPlayerId, pending, error, join } = useOpenMatch(useMatchById(matchId))
  const href = `/history/${matchId}`

  const renderJoin = () => {
    if (!state) return null
    if (!myPlayerId) {
      return (
        <Link href={href} className={buttonClasses({ size: 'sm' })}>
          Unirse
        </Link>
      )
    }
    if (state.myPosition) {
      return <span className="text-xs font-semibold text-primary">{SIGNED_UP_LABEL[state.myPosition]}</span>
    }
    const action = getOpenMatchAction(state)
    return (
      <Button size="sm" onClick={join} disabled={!action.enabled || pending} aria-busy={pending}>
        {pending ? 'Guardando…' : action.label === 'Inscribirme' ? 'Unirse' : action.label}
      </Button>
    )
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        {renderJoin()}
        <Link href={href} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
          Ver partido
        </Link>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-orange-700">
          {error}
        </p>
      )}
    </div>
  )
}
