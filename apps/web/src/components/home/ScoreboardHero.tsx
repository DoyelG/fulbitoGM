'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { TrophyIcon } from '@heroicons/react/24/solid'
import { formatLongMatchDate, pickLatestFinalMatch } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { useHomeStatus } from '@/hooks/use-home-status'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'
import ScoreboardResult from './ScoreboardResult'
import ScoreboardSkeleton from './ScoreboardSkeleton'

const FOCUS_ON_DARK = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

export default function ScoreboardHero() {
  const matches = useMatchStore((s) => s.matches)
  const { status, retry } = useHomeStatus()
  const latest = useMemo(() => pickLatestFinalMatch(matches), [matches])
  const isEmpty = status === 'ready' && !latest
  const tournamentPhotoUrl = useTournamentStore(selectActiveTournament)?.tournament.photoUrl ?? null

  return (
    <section
      aria-labelledby="scoreboard-title"
      aria-busy={status === 'loading'}
      className="bg-primary-gradient relative isolate flex h-full flex-col justify-center overflow-hidden rounded-3xl px-5 py-5 text-center text-white shadow-xl sm:px-8 sm:py-5"
    >
      <Image
        src="/scoreboard-ball.jpg"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 736px, 100vw"
        className="pointer-events-none -z-10 object-cover object-right opacity-50 mix-blend-luminosity select-none [mask-image:linear-gradient(to_left,black_20%,transparent_70%)] sm:opacity-70"
      />
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 sm:grid-cols-[3rem_minmax(0,1fr)_3rem] lg:grid-cols-[4rem_minmax(0,1fr)_4rem]">
        <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-1 ring-white/30 sm:-my-2.5 lg:-my-6 lg:h-16 lg:w-16 lg:translate-y-7.5">
          {tournamentPhotoUrl ? (
            <Image
              src={tournamentPhotoUrl}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1024px) 64px, 36px"
              className="object-cover"
            />
          ) : (
            <TrophyIcon className="h-5 w-5 text-violet-100 lg:h-8 lg:w-8" aria-hidden />
          )}
        </span>
        <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
          <h2 id="scoreboard-title" className="text-xs font-bold tracking-[0.14em] text-violet-200 uppercase">
            Último partido
          </h2>
          {status === 'ready' && latest && (
            <p className="text-sm text-violet-100/80 first-letter:uppercase">{formatLongMatchDate(latest.date)}</p>
          )}
        </div>
        {status === 'ready' && latest && (
          <span className="justify-self-end rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-white">
            {latest.type}
          </span>
        )}
      </div>

      <div aria-live="polite" className="mt-3 sm:mt-2">
        {status === 'loading' && <ScoreboardSkeleton />}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-300">No pudimos cargar los partidos.</p>
            <button
              type="button"
              onClick={retry}
              className={`min-h-11 rounded-lg border border-white/30 px-4 text-sm font-semibold hover:bg-white/10 ${FOCUS_ON_DARK}`}
            >
              Reintentar
            </button>
          </div>
        )}
        {isEmpty && <p className="text-lg text-gray-300">Todavía no hay partidos</p>}
        {status === 'ready' && latest && (
          <ScoreboardResult
            match={latest}
            action={
              <Link
                href={`/history/${latest.id}`}
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-secondary px-6 py-2 font-extrabold text-night shadow-lg shadow-secondary/35 transition sm:ml-2 sm:w-auto hover:brightness-110 ${FOCUS_ON_DARK}`}
              >
                Ver partido
              </Link>
            }
          />
        )}
      </div>
    </section>
  )
}
