import type { ComponentType, ReactNode } from 'react'
import type { Match, Player } from '@fulbito/types'
import { formatLongMatchDate, formatMatchClock, parseMatchDate } from '@fulbito/utils'
import { CalendarIcon, ClockIcon, InformationCircleIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { FaTshirt } from 'react-icons/fa'
import MatchLocationLink from '@/components/MatchLocationLink'
import DetailSection from '@/components/tournaments/detail/DetailSection'

type Props = {
  match: Match
  playerById: Map<string, Player>
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-gray-700">{label}</dt>
        <dd className="text-sm font-medium text-gray-900">{children}</dd>
      </div>
    </div>
  )
}

export default function MatchInfoPanel({ match, playerById }: Props) {
  const { date, hour } = parseMatchDate(match)
  const playersCount = match.teamA.length + match.teamB.length
  const shirtsName = match.shirtsResponsibleId ? playerById.get(match.shirtsResponsibleId)?.name : undefined

  return (
    <DetailSection id="match-info-title" title="Datos del partido" icon={InformationCircleIcon}>
      <dl className="divide-y divide-gray-100">
        <InfoRow icon={CalendarIcon} label="Fecha">
          <span className="inline-block first-letter:uppercase">{formatLongMatchDate(date)}</span>
        </InfoRow>
        <InfoRow icon={ClockIcon} label="Hora">
          {hour !== null ? formatMatchClock(hour) : <span className="italic text-gray-700">Sin horario</span>}
        </InfoRow>
        <InfoRow icon={MapPinIcon} label="Cancha">
          {match.location ? (
            <>
              <MatchLocationLink location={match.location} />
              {match.location.street && (
                <span className="block text-xs font-normal text-gray-700">{match.location.street}</span>
              )}
            </>
          ) : (
            <span className="italic text-gray-700">Sin cancha</span>
          )}
        </InfoRow>
        <InfoRow icon={UserGroupIcon} label="Modalidad">
          {match.type} · {playersCount} {playersCount === 1 ? 'jugador' : 'jugadores'}
        </InfoRow>
        <InfoRow icon={FaTshirt} label="Lava las remeras">
          {shirtsName ?? <span className="italic text-gray-700">Sin asignar</span>}
        </InfoRow>
      </dl>
      {match.description && (
        <p className="mt-3 whitespace-pre-line rounded-lg bg-gray-50 p-3 text-sm text-gray-800">{match.description}</p>
      )}
    </DetailSection>
  )
}
