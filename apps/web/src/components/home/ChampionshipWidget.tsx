'use client'

import { useMemo } from 'react'
import { CHAMPIONSHIP_THRESHOLD, onlyFinalMatches, pickChampionshipProgress, pickStreakLeaders } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useHomeStatus } from '@/hooks/use-home-status'
import ChampionshipChasers from './ChampionshipChasers'
import ChampionshipTrack from './ChampionshipTrack'
import PlayerAvatar from './PlayerAvatar'
import WidgetCard from './WidgetCard'
import WidgetError from './WidgetError'
import WidgetSkeleton from './WidgetSkeleton'

const CHASER_LIMIT = 2

function streakLabel(streak: number): string {
  return streak === 1 ? '1 victoria seguida' : `${streak} victorias seguidas`
}

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
  const streak = progress?.streak ?? 0
  const trackLabel = `Progreso al campeonato: ${Math.min(streak, CHAMPIONSHIP_THRESHOLD)} de ${CHAMPIONSHIP_THRESHOLD} victorias`

  return (
    <WidgetCard
      id="championship"
      emoji="🏆"
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
            <div className="flex min-w-0 items-center gap-3">
              <PlayerAvatar name={progress.playerName} photoUrl={progress.playerPhotoUrl} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-gray-900">{progress.playerName}</p>
                <p className="text-sm text-gray-600">{streakLabel(progress.streak)}</p>
              </div>
              <p aria-hidden className="shrink-0 leading-none">
                <span className="text-4xl font-black text-brand tabular-nums">
                  {Math.min(streak, CHAMPIONSHIP_THRESHOLD)}
                </span>
                <span className="text-lg font-bold text-gray-500">/{CHAMPIONSHIP_THRESHOLD}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Nadie viene ganando seguido todavía.</p>
          )}
          <ChampionshipTrack streak={streak} label={trackLabel} />
          {progress && (
            <p className="text-sm text-gray-700">
              {progress.isChampion ? <strong>{remainingLabel(streak)}</strong> : remainingLabel(streak)}
            </p>
          )}
          <ChampionshipChasers chasers={chasers} />
        </div>
      )}
    </WidgetCard>
  )
}
