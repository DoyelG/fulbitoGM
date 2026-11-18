'use client'

import Link from 'next/link'
import type { Match } from '@fulbito/types'
import { formatLongMatchDate, formatMatchClock, openMatchSummary, parseMatchDate } from '@fulbito/utils'
import { useOpenMatch } from '@/hooks/use-open-match'
import OpenMatchSignupButton from '@/components/matches/OpenMatchSignupButton'

const FOCUS_ON_DARK = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

export default function OpenNextMatch({ match }: { match: Match }) {
  const controller = useOpenMatch(match)
  const live = controller.match ?? match
  const { hour } = parseMatchDate(live)
  const state = controller.state

  return (
    <>
      <div className="min-w-0">
        <h2 id="next-match-title" className="text-xs font-bold tracking-[0.14em] text-violet-200 uppercase">
          Próximo partido · Abierto{live.name ? ` · ${live.name}` : ''}
        </h2>
        <p className="mt-1 text-xl font-extrabold first-letter:uppercase sm:text-2xl">
          {formatLongMatchDate(live.date)}
          {hour !== null && <span className="text-secondary"> · {formatMatchClock(hour)}hs</span>}
        </p>
        {state && (
          <p className="mt-1 text-sm text-violet-100">
            {openMatchSummary(state)}
            <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold text-white tabular-nums">
              {state.confirmed.length}/{state.capacity}
            </span>
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-start">
        <OpenMatchSignupButton controller={controller} tone="dark" idPrefix="home-open-match" />
        <Link
          href={`/history/${live.id}`}
          className={`inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl border border-white/60 px-6 py-3 font-extrabold text-white transition hover:bg-white/10 ${FOCUS_ON_DARK}`}
        >
          Ver partido
        </Link>
      </div>
    </>
  )
}
