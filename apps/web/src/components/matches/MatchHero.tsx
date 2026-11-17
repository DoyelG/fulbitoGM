import Image from 'next/image'
import type { Match } from '@fulbito/types'
import { TrophyIcon } from '@heroicons/react/24/solid'
import { formatLongMatchDate, parseMatchDate } from '@fulbito/utils'

type Props = {
  match: Match
  tournamentPhotoUrl: string | null
}

function Badge({ children }: { children: string }) {
  return <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold text-white">{children}</span>
}

function TeamName({ label, highlight }: { label: string; highlight: boolean }) {
  return (
    <p
      className={`min-w-0 flex-1 truncate text-base font-bold sm:text-lg ${highlight ? 'text-white' : 'text-violet-200'}`}
    >
      {label}
    </p>
  )
}

export default function MatchHero({ match, tournamentPhotoUrl }: Props) {
  const isDraft = match.status === 'draft'
  const { date } = parseMatchDate(match)
  const winA = !isDraft && match.teamAScore > match.teamBScore
  const winB = !isDraft && match.teamBScore > match.teamAScore

  return (
    <section
      aria-labelledby="match-title"
      className="bg-primary-gradient relative isolate overflow-hidden rounded-2xl px-5 py-4 text-white shadow-lg sm:px-6"
    >
      <div className="flex flex-col items-center gap-2 sm:grid sm:grid-cols-[1fr_minmax(0,auto)_1fr]">
        <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-1 ring-white/30 sm:justify-self-start">
          {tournamentPhotoUrl ? (
            <Image src={tournamentPhotoUrl} alt="" fill unoptimized sizes="40px" className="object-cover" />
          ) : (
            <TrophyIcon className="h-5 w-5 text-violet-100" aria-hidden />
          )}
        </span>
        <h1
          id="match-title"
          className="max-w-full truncate text-center text-xl font-extrabold first-letter:uppercase sm:text-2xl"
        >
          {match.name || formatLongMatchDate(date)}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-self-end">
          <Badge>{match.type}</Badge>
          {match.isFriendly && <Badge>Amistoso</Badge>}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-center sm:gap-6">
        <TeamName label="Equipo A" highlight={!winB} />
        <p
          className="shrink-0 rounded-xl bg-white/10 px-4 py-1 text-3xl font-extrabold tabular-nums"
          aria-label={isDraft ? 'Sin resultado todavía' : `Resultado: ${match.teamAScore} a ${match.teamBScore}`}
        >
          {isDraft ? '0 – 0' : `${match.teamAScore} – ${match.teamBScore}`}
        </p>
        <TeamName label="Equipo B" highlight={!winA} />
      </div>
    </section>
  )
}
