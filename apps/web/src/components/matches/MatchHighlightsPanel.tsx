import Link from 'next/link'
import type { Match } from '@fulbito/types'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { TrophyIcon } from '@heroicons/react/24/solid'
import DetailSection from '@/components/tournaments/detail/DetailSection'

type Props = {
  match: Match
}

const LINK_CLASS =
  'rounded hover:text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'

export default function MatchHighlightsPanel({ match }: Props) {
  const everyone = [
    ...match.teamA.map((player) => ({ ...player, team: 'A' })),
    ...match.teamB.map((player) => ({ ...player, team: 'B' })),
  ]
  const mvp = match.mvpId ? everyone.find((player) => player.id === match.mvpId) : undefined
  const scorers = everyone.filter((player) => player.goals > 0).sort((a, b) => b.goals - a.goals)

  return (
    <DetailSection id="match-highlights-title" title="Destacados" icon={SparklesIcon}>
      {mvp ? (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-secondary/10 p-3">
          <TrophyIcon className="h-8 w-8 shrink-0 text-secondary" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-800">MVP</p>
            <Link href={`/players/${mvp.id}`} className={`block truncate font-bold text-gray-900 ${LINK_CLASS}`}>
              {mvp.name}
            </Link>
          </div>
        </div>
      ) : (
        <p className="mb-4 text-sm italic text-gray-700">Sin MVP elegido.</p>
      )}
      <h3 className="mb-2 text-sm font-semibold text-gray-900">Goleadores</h3>
      {scorers.length === 0 ? (
        <p className="text-sm italic text-gray-700">Nadie hizo goles.</p>
      ) : (
        <ol className="divide-y divide-gray-100">
          {scorers.map((player) => (
            <li key={player.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0 truncate">
                <Link href={`/players/${player.id}`} className={`font-medium text-gray-900 ${LINK_CLASS}`}>
                  {player.name}
                </Link>
                <span className="ml-1.5 text-xs text-gray-700">Equipo {player.team}</span>
              </span>
              <span className="shrink-0 font-bold tabular-nums text-gray-900" aria-label={`${player.goals} goles`}>
                {player.goals} ⚽
              </span>
            </li>
          ))}
        </ol>
      )}
    </DetailSection>
  )
}
