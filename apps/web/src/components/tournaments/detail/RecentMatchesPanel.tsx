import type { Match } from '@fulbito/types'
import { formatMatchDate, parseMatchDate } from '@fulbito/utils'
import { ClockIcon } from '@heroicons/react/24/outline'
import DetailSection from './DetailSection'

type Props = {
  matches: Match[]
}

function resultLabel(match: Match): string {
  if (match.teamAScore === match.teamBScore) return 'Empate'
  return match.teamAScore > match.teamBScore ? 'Ganó Equipo A' : 'Ganó Equipo B'
}

export default function RecentMatchesPanel({ matches }: Props) {
  return (
    <DetailSection
      id="recent-matches-title"
      title="Últimos partidos"
      icon={ClockIcon}
      action={{ label: 'Ver todos', href: '/history' }}
    >
      {matches.length === 0 ? (
        <p className="text-sm italic text-gray-700">Todavía no se jugó ningún partido.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {matches.map((match) => (
            <li key={match.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {match.name || formatMatchDate(parseMatchDate(match).date)}
                </p>
                <p className="text-xs text-gray-700">
                  {match.name ? `${formatMatchDate(parseMatchDate(match).date)} · ` : ''}
                  {match.type}
                  {match.isFriendly ? ' · Amistoso' : ''}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className="text-lg font-bold tabular-nums text-gray-900"
                  aria-label={`${match.teamAScore} a ${match.teamBScore}`}
                >
                  {match.teamAScore} - {match.teamBScore}
                </p>
                <p className="text-xs text-gray-700">{resultLabel(match)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DetailSection>
  )
}
