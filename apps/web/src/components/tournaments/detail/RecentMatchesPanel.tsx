import Link from 'next/link'
import type { Match } from '@fulbito/types'
import { formatMatchDate, parseMatchDate } from '@fulbito/utils'
import { ClockIcon } from '@heroicons/react/24/outline'
import DetailSection from './DetailSection'

type Props = {
  matches: Match[]
  onOpenMatch: () => void
}

function resultLabel(match: Match): string {
  if (match.teamAScore === match.teamBScore) return 'Empate'
  return match.teamAScore > match.teamBScore ? 'Ganó Equipo A' : 'Ganó Equipo B'
}

export default function RecentMatchesPanel({ matches, onOpenMatch }: Props) {
  return (
    <DetailSection
      id="recent-matches-title"
      title="Últimos partidos"
      icon={ClockIcon}
      action={
        <Link
          href="/history"
          onClick={onOpenMatch}
          className="rounded text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Ver todos
        </Link>
      }
    >
      {matches.length === 0 ? (
        <p className="text-sm italic text-gray-700">Todavía no se jugó ningún partido.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {matches.map((match) => (
            <li key={match.id}>
              <Link
                href={`/history/${match.id}`}
                onClick={onOpenMatch}
                className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DetailSection>
  )
}
