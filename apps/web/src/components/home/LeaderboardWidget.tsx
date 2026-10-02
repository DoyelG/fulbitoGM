'use client'

import { useMemo, useState } from 'react'
import { computeSeasonStatRows, onlyFinalMatches, rankStatRows } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useHomeStatus } from '@/hooks/use-home-status'
import LeaderboardList from './LeaderboardList'
import LeaderboardTabs from './LeaderboardTabs'
import WidgetCard from './WidgetCard'
import WidgetError from './WidgetError'
import WidgetSkeleton from './WidgetSkeleton'

type Stat = 'goals' | 'mvps'

const LIMIT = 5
const ID = 'leaderboard'

const STATS = {
  goals: {
    label: 'Goleadores',
    singular: 'gol',
    plural: 'goles',
    pillClass: 'bg-orange-100 text-orange-800',
    emptyText: 'Todavía no hay goles esta temporada.',
  },
  mvps: {
    label: 'MVPs',
    singular: 'MVP',
    plural: 'MVPs',
    pillClass: 'bg-brand/10 text-brand',
    emptyText: 'Todavía no hay MVPs esta temporada.',
  },
}

const TABS = (Object.keys(STATS) as Stat[]).map((key) => ({ key, label: STATS[key].label }))

export default function LeaderboardWidget() {
  const players = usePlayerStore((s) => s.players)
  const matches = useMatchStore((s) => s.matches)
  const { status, retry } = useHomeStatus()
  const [active, setActive] = useState<Stat>('goals')
  const season = new Date().getFullYear()
  const rows = useMemo(
    () => computeSeasonStatRows(players, onlyFinalMatches(matches), season),
    [players, matches, season],
  )
  const entries = useMemo(() => rankStatRows(rows, active, LIMIT), [rows, active])
  const config = STATS[active]

  return (
    <WidgetCard
      id={ID}
      emoji="⚽"
      title="Goleadores y MVPs"
      href="/statistics"
      linkLabel="Ver estadísticas"
      busy={status === 'loading'}
    >
      {status === 'loading' && <WidgetSkeleton rows={5} />}
      {status === 'error' && <WidgetError onRetry={retry} />}
      {status === 'ready' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <LeaderboardTabs idPrefix={ID} tabs={TABS} active={active} onChange={setActive} />
            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Temporada {season}</p>
          </div>
          <div
            role="tabpanel"
            id={`${ID}-panel`}
            aria-labelledby={`${ID}-tab-${active}`}
            tabIndex={0}
            className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <LeaderboardList
              entries={entries}
              singular={config.singular}
              plural={config.plural}
              pillClass={config.pillClass}
              emptyText={config.emptyText}
            />
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
