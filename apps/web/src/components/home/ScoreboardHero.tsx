'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { pickLatestFinalMatch } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { useHomeStatus } from '@/hooks/use-home-status'
import ScoreboardResult from './ScoreboardResult'
import ScoreboardSkeleton from './ScoreboardSkeleton'

const FOCUS_ON_DARK = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

export default function ScoreboardHero() {
  const matches = useMatchStore((s) => s.matches)
  const { status, retry } = useHomeStatus()
  const latest = useMemo(() => pickLatestFinalMatch(matches), [matches])
  const isEmpty = status === 'ready' && !latest

  return (
    <section
      aria-labelledby="scoreboard-title"
      aria-busy={status === 'loading'}
      className="bg-scoreboard relative isolate overflow-hidden rounded-3xl px-4 py-8 text-center text-white shadow-xl sm:px-10 sm:py-10"
    >
      <Image
        src="/scoreboard-ball.jpg"
        alt=""
        fill
        priority
        sizes="(min-width: 1152px) 1104px, 100vw"
        className="pointer-events-none -z-10 object-cover object-right opacity-50 mix-blend-luminosity select-none [mask-image:linear-gradient(to_left,black_20%,transparent_70%)] sm:opacity-70"
      />
      <h2 id="scoreboard-title" className="text-xs font-bold tracking-[0.14em] text-violet-200 uppercase">
        Último partido
      </h2>

      <div aria-live="polite" className="mt-5">
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
        {status === 'ready' && latest && <ScoreboardResult match={latest} />}
      </div>

      <div className="mt-7 flex flex-col items-center gap-2">
        <Link
          href="/match"
          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-extrabold text-night shadow-lg shadow-accent/35 transition hover:brightness-110 sm:w-auto ${FOCUS_ON_DARK}`}
        >
          <span aria-hidden>⚽</span>
          {isEmpty ? 'Armá el primero' : 'Preparar el próximo partido'}
        </Link>
        {status === 'ready' && latest && (
          <Link
            href="/history"
            className={`inline-flex min-h-11 items-center rounded px-2 text-sm text-violet-300 underline underline-offset-4 hover:text-white ${FOCUS_ON_DARK}`}
          >
            Ver historial
          </Link>
        )}
      </div>
    </section>
  )
}
