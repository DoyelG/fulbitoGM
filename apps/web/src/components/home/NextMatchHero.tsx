'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import {
  daysUntilMatch,
  formatLongMatchDate,
  formatMatchClock,
  matchLocationMapsUrl,
  parseMatchDate,
  pickNextMatch,
} from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { useHomeStatus } from '@/hooks/use-home-status'

const FOCUS_ON_DARK = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

function localToday(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${String(now.getDate()).padStart(2, '0')}`
}

function countdownLabel(days: number): string {
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  return `En ${days} días`
}

export default function NextMatchHero() {
  const matches = useMatchStore((s) => s.matches)
  const { status } = useHomeStatus()
  const today = localToday()
  const next = useMemo(() => pickNextMatch(matches, today), [matches, today])

  if (status === 'error') return null

  const { hour } = next ? parseMatchDate(next) : { hour: null }

  return (
    <section
      aria-labelledby="next-match-title"
      aria-busy={status === 'loading'}
      className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-brand-dark to-night px-5 py-5 text-white shadow-xl sm:px-8"
    >
      <div aria-live="polite" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {status === 'loading' && (
          <>
            <span className="sr-only">Cargando el próximo partido…</span>
            <div aria-hidden className="h-14 w-64 animate-pulse rounded-xl bg-white/10" />
          </>
        )}
        {status === 'ready' && !next && (
          <>
            <div>
              <h2 id="next-match-title" className="text-xs font-bold tracking-[0.14em] text-violet-200 uppercase">
                Próximo partido
              </h2>
              <p className="mt-1 text-lg font-semibold">No hay partido armado</p>
            </div>
            <Link
              href="/match"
              className={`inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-6 py-3 font-extrabold text-night shadow-lg shadow-accent/35 transition hover:brightness-110 ${FOCUS_ON_DARK}`}
            >
              Armá el próximo
            </Link>
          </>
        )}
        {status === 'ready' && next && (
          <>
            <div className="min-w-0">
              <h2 id="next-match-title" className="text-xs font-bold tracking-[0.14em] text-violet-200 uppercase">
                Próximo partido · {countdownLabel(daysUntilMatch(next.date, localToday()))}
              </h2>
              <p className="mt-1 text-xl font-extrabold first-letter:uppercase sm:text-2xl">
                {formatLongMatchDate(next.date)}
                {hour !== null && <span className="text-accent"> · {formatMatchClock(hour)}</span>}
              </p>
              {next.location && (
                <a
                  href={matchLocationMapsUrl(next.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-1 inline-flex min-h-11 items-center gap-1 rounded text-sm text-violet-200 underline-offset-4 hover:text-white hover:underline ${FOCUS_ON_DARK}`}
                >
                  <MapPinIcon aria-hidden className="h-4 w-4 shrink-0" />
                  {next.location.name}
                  <span className="sr-only"> (abre el mapa en una pestaña nueva)</span>
                </a>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/history"
                className={`inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-6 py-3 font-extrabold text-night shadow-lg shadow-accent/35 transition hover:brightness-110 ${FOCUS_ON_DARK}`}
              >
                Ver equipos
              </Link>
              <Link
                href="/match"
                className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/10 ${FOCUS_ON_DARK}`}
              >
                Preparar partido
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
