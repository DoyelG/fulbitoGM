'use client'

import { useMemo } from 'react'
import { CHAMPIONSHIP_THRESHOLD, onlyFinalMatches, pickChampionshipProgress } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useHomeStatus } from '@/hooks/use-home-status'
import ChampionshipTrack from './ChampionshipTrack'
import PlayerAvatar from './PlayerAvatar'
import WidgetCard from './WidgetCard'
import WidgetError from './WidgetError'
import WidgetSkeleton from './WidgetSkeleton'

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
  const trackLabel = `Progreso al campeonato: ${progress?.streak ?? 0} de ${CHAMPIONSHIP_THRESHOLD} victorias`

  return (
    <WidgetCard
      id="championship"
      emoji="🏆"
      title="Carrera al campeonato"
      href="/awards"
      linkLabel="Ver premios"
      busy={status === 'loading'}
    >
      {status === 'loading' && <WidgetSkeleton rows={1} />}
      {status === 'error' && <WidgetError onRetry={retry} />}
      {status === 'ready' && (
        <div className="space-y-3">
          {progress ? (
            <div className="flex min-w-0 items-center gap-3">
              <PlayerAvatar name={progress.playerName} photoUrl={progress.playerPhotoUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-gray-900">{progress.playerName}</p>
                <p className="text-sm text-gray-600">{streakLabel(progress.streak)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Nadie viene ganando seguido todavía.</p>
          )}
          <ChampionshipTrack streak={progress?.streak ?? 0} label={trackLabel} />
          {progress && (
            <p className="text-sm text-gray-700">
              {progress.isChampion ? <strong>{remainingLabel(progress.streak)}</strong> : remainingLabel(progress.streak)}
            </p>
          )}
        </div>
      )}
    </WidgetCard>
  )
}
