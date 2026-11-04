import type { ComponentType, MouseEvent, ReactNode } from 'react'
import Link from 'next/link'
import { CalendarDaysIcon, UserCircleIcon, UsersIcon } from '@heroicons/react/24/outline'

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>

type Props = {
  tournamentId: string
  members: number
  playerId: string | null
  playerName: string | null
  nextMatchLabel: string | null
  onNavigate: () => void
  onLinkPlayer: () => void
}

type StatProps = {
  icon: IconType
  children: ReactNode
  muted?: boolean
  href?: string
  ariaLabel?: string
  onNavigate: () => void
  onClick?: () => void
}

const tileClassName =
  'flex min-h-11 min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm ring-1 ring-inset ring-gray-200'
const interactiveClassName =
  'transition-colors hover:bg-primary/5 hover:ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'

function Stat({ icon: Icon, children, muted = false, href, ariaLabel, onNavigate, onClick }: StatProps) {
  const content = (
    <>
      <Icon className={`h-5 w-5 shrink-0 ${href || onClick ? 'text-primary' : 'text-gray-500'}`} aria-hidden />
      <span className={`min-w-0 truncate ${muted ? 'italic text-gray-700' : 'font-semibold text-gray-900'}`}>
        {children}
      </span>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onClick()
        }}
        aria-label={ariaLabel}
        className={`${tileClassName} ${interactiveClassName} text-left`}
      >
        {content}
      </button>
    )
  }

  if (!href) return <div className={tileClassName}>{content}</div>

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation()
    onNavigate()
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`${tileClassName} ${interactiveClassName}`}
    >
      {content}
    </Link>
  )
}

export default function TournamentCardStats({
  tournamentId,
  members,
  playerId,
  playerName,
  nextMatchLabel,
  onNavigate,
  onLinkPlayer,
}: Props) {
  const membersLabel = `${members} ${members === 1 ? 'jugador' : 'jugadores'}`
  const linkedPlayerLabel = playerName ?? 'Mi jugador'

  return (
    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Stat
        icon={UsersIcon}
        href={`/tournaments/${tournamentId}/members`}
        ariaLabel={`${membersLabel}. Ver miembros`}
        onNavigate={onNavigate}
      >
        {membersLabel}
      </Stat>
      <Stat
        icon={UserCircleIcon}
        muted={!playerId}
        href={playerId ? `/players/${playerId}` : undefined}
        ariaLabel={
          playerId ? `Tu jugador: ${linkedPlayerLabel}. Ver jugador` : 'Sin jugador asignado. Vincular jugador'
        }
        onNavigate={onNavigate}
        onClick={playerId ? undefined : onLinkPlayer}
      >
        {playerId ? linkedPlayerLabel : 'Sin asignar'}
      </Stat>
      <div className="sm:col-span-2">
        <Stat
          icon={CalendarDaysIcon}
          muted={!nextMatchLabel}
          href="/history"
          ariaLabel={`Próximo partido: ${nextMatchLabel ?? 'sin definir'}. Ver historial`}
          onNavigate={onNavigate}
        >
          {nextMatchLabel ? `Próximo partido: ${nextMatchLabel}` : 'Próximo partido sin definir'}
        </Stat>
      </div>
    </div>
  )
}
