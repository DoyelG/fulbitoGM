'use client'

import { useMemo } from 'react'
import { pickStreakLeaders } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useHomeStatus } from '@/hooks/use-home-status'
import StreakGroup from './StreakGroup'
import WidgetCard from './WidgetCard'
import WidgetError from './WidgetError'
import WidgetSkeleton from './WidgetSkeleton'

const LIMITS = { winLimit: 3, lossLimit: 2 }

export default function StreaksWidget() {
  const players = usePlayerStore((s) => s.players)
  const matches = useMatchStore((s) => s.matches)
  const { status, retry } = useHomeStatus()
  const { winning, losing } = useMemo(() => pickStreakLeaders(players, matches, LIMITS), [players, matches])
  const isEmpty = winning.length === 0 && losing.length === 0

  return (
    <WidgetCard
      id="streaks"
      emoji="🔥"
      title="En racha"
      href="/statistics"
      linkLabel="Ver estadísticas"
      busy={status === 'loading'}
    >
      {status === 'loading' && <WidgetSkeleton rows={3} />}
      {status === 'error' && <WidgetError onRetry={retry} />}
      {status === 'ready' && isEmpty && <p className="text-sm text-gray-600">Nadie está en racha por ahora.</p>}
      {status === 'ready' && !isEmpty && (
        <div className="space-y-4">
          <StreakGroup title="Ganando" kind="win" leaders={winning} />
          <StreakGroup title="Perdiendo" kind="loss" leaders={losing} />
        </div>
      )}
    </WidgetCard>
  )
}
