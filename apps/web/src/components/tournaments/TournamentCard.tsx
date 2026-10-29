import type { Match, MyTournament } from '@fulbito/types'
import { formatMatchDate, formatMatchHour, parseMatchDate } from '@fulbito/utils'
import type { ComponentType } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRightStartOnRectangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import TournamentCardStats from './TournamentCardStats'
import { ROLE_LABELS, ROLE_STYLES } from './tournament-roles'

type Props = {
  item: MyTournament
  active: boolean
  onActivate: (tournamentId: string) => void
  onEdit: (item: MyTournament) => void
  onDelete: (item: MyTournament) => void
  onLeave: (item: MyTournament) => void
  nextMatch?: Pick<Match, 'date' | 'hasTime'> | null
  playerName?: string | null
}

function formatNextMatch(match: Pick<Match, 'date' | 'hasTime'>): string {
  const { date, hour } = parseMatchDate(match)
  return hour === null ? formatMatchDate(date) : `${formatMatchDate(date)} · ${formatMatchHour(hour)}`
}

type CardActionProps = {
  label: string
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  onClick: () => void
  tone?: 'default' | 'danger'
}

const actionClassName =
  'flex h-11 w-11 items-center justify-center rounded-lg sm:h-9 sm:w-9 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'

function CardAction({ label, icon: Icon, onClick, tone = 'default' }: CardActionProps) {
  const toneClassName =
    tone === 'danger' ? 'text-red-700 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100 hover:text-brand'
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      aria-label={label}
      title={label}
      className={`${actionClassName} ${toneClassName}`}
    >
      <Icon className="h-6 w-6 sm:h-5 sm:w-5" aria-hidden />
    </button>
  )
}

export default function TournamentCard({
  item,
  active,
  onActivate,
  onEdit,
  onDelete,
  onLeave,
  nextMatch = null,
  playerName = null,
}: Props) {
  const { tournament, membership } = item
  const canEdit = membership.role === 'OWNER' || membership.role === 'ADMIN'
  const canDelete = membership.role === 'OWNER'

  return (
    <article
      aria-current={active ? 'true' : undefined}
      onClick={active ? undefined : () => onActivate(tournament.id)}
      className={`flex h-full overflow-hidden rounded-xl border bg-white shadow-sm transition-colors ${
        active ? 'border-brand ring-2 ring-brand/30' : 'cursor-pointer border-gray-200 hover:border-brand/50'
      }`}
    >
      <div className="relative w-20 shrink-0 self-stretch bg-indigo-50 sm:w-28">
        {tournament.photoUrl ? (
          <Image src={tournament.photoUrl} alt="" fill unoptimized sizes="112px" className="object-cover" />
        ) : (
          <TrophyIcon className="absolute inset-0 m-auto h-10 w-10 text-indigo-600" aria-hidden />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-start sm:gap-4 sm:p-5">
        <div className="min-w-0 flex-1 p-4 sm:p-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 break-words">
              <Link
                href={`/tournaments/${tournament.id}`}
                onClick={(event) => event.stopPropagation()}
                className="rounded hover:text-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {tournament.name}
              </Link>
            </h2>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_STYLES[membership.role]}`}
            >
              {ROLE_LABELS[membership.role]}
            </span>
          </div>
          {tournament.description && <p className="mt-1 text-sm text-gray-700">{tournament.description}</p>}
          <TournamentCardStats
            members={tournament.memberUids.length}
            playerId={membership.playerId}
            playerName={playerName}
            nextMatchLabel={nextMatch ? formatNextMatch(nextMatch) : null}
            onNavigate={() => {
              if (!active) onActivate(tournament.id)
            }}
          />
        </div>
        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-0.5 border-t border-gray-100 px-2 py-1 sm:flex-col sm:self-center sm:border-0 sm:p-0">
          {active ? (
            <span className={`${actionClassName} text-brand`} title="Torneo activo">
              <CheckCircleSolidIcon className="h-6 w-6 sm:h-5 sm:w-5" aria-hidden />
              <span className="sr-only">Torneo activo</span>
            </span>
          ) : (
            <CardAction
              label={`Activar ${tournament.name}`}
              icon={CheckCircleIcon}
              onClick={() => onActivate(tournament.id)}
            />
          )}
          <Link
            href={`/tournaments/${tournament.id}`}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Ver información de ${tournament.name}`}
            title="Ver información del torneo"
            className={`${actionClassName} text-gray-700 hover:bg-gray-100 hover:text-brand`}
          >
            <InformationCircleIcon className="h-6 w-6 sm:h-5 sm:w-5" aria-hidden />
          </Link>
          {canEdit && (
            <CardAction label={`Editar ${tournament.name}`} icon={PencilSquareIcon} onClick={() => onEdit(item)} />
          )}
          {canDelete && (
            <CardAction
              label={`Eliminar ${tournament.name}`}
              icon={TrashIcon}
              onClick={() => onDelete(item)}
              tone="danger"
            />
          )}
          {!canDelete && (
            <CardAction
              label={`Abandonar ${tournament.name}`}
              icon={ArrowRightStartOnRectangleIcon}
              onClick={() => onLeave(item)}
              tone="danger"
            />
          )}
        </div>
      </div>
    </article>
  )
}
