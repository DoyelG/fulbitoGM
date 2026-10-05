'use client'

import { useMemo } from 'react'
import { CHAMPIONSHIP_THRESHOLD, onlyFinalMatches, pickChampionshipProgress, pickStreakLeaders } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useHomeStatus } from '@/hooks/use-home-status'
import ChampionshipStandings, { type StandingRow } from './ChampionshipStandings'
import WidgetCard from './WidgetCard'
import WidgetError from './WidgetError'
import WidgetSkeleton from './WidgetSkeleton'

const CHASER_LIMIT = 2

function remainingLabel(streak: number): string {
  const left = CHAMPIONSHIP_THRESHOLD - streak
  if (left <= 0) return '¡Salió campeón!'
  return left === 1 ? 'Le falta 1 victoria para salir campeón' : `Le faltan ${left} victorias para salir campeón`
}

export default function ChampionshipWidget() {
  const players = usePlayerStore((s) => s.players)
  const matches = useMatchStore((s) => s.matches)
  const { status, retry } = useHomeStatus()
  const progress = useMemo(() => pickChampionshipProgress(players, onlyFinalMatches(matches)), [players, matches])
  const chasers = useMemo(
    () =>
      pickStreakLeaders(players, matches, { winLimit: CHASER_LIMIT + 1, lossLimit: 0 })
        .winning.filter((l) => l.playerId !== progress?.playerId)
        .slice(0, CHASER_LIMIT),
    [players, matches, progress],
  )
  const rows = useMemo<StandingRow[]>(
    () => [...(progress ? [{ ...progress }] : []), ...chasers.map((c) => ({ ...c, streak: c.count }))],
    [progress, chasers],
  )

  return (
    <WidgetCard
      id="championship"
      emoji="🏆"
      tone="brand"
      title="Carrera al campeonato"
      href="/awards"
      linkLabel="Ver premios"
      busy={status === 'loading'}
    >
      {status === 'loading' && <WidgetSkeleton rows={3} />}
      {status === 'error' && <WidgetError onRetry={retry} />}
      {status === 'ready' && (
        <div className="space-y-4">
          {progress ? (
            <p className="text-sm text-gray-700">
              {progress.isChampion ? (
                <strong className="text-emerald-700">{remainingLabel(progress.streak)}</strong>
              ) : (
                remainingLabel(progress.streak)
              )}
            </p>
          ) : (
            <p className="text-sm text-gray-600">Nadie viene ganando seguido todavía.</p>
          )}
          <ChampionshipStandings rows={rows} />
        </div>
      )}
    </WidgetCard>
  )
}
