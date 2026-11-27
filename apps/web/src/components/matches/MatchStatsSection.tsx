import { ChartBarIcon } from '@heroicons/react/24/outline'
import { SKILL_KEYS, type SkillKey, type TeamSkillAverages } from '@fulbito/utils'
import DetailSection from '@/components/tournaments/detail/DetailSection'

type TeamStats = { skills: TeamSkillAverages; winProbability: number }

type Props = { teamA: TeamStats; teamB: TeamStats; className?: string }

type StatRow = { key: string; label: string; a: number | null; b: number | null; isPercent?: boolean }

const SKILL_LABELS: Record<SkillKey, string> = {
  physical: 'Físico',
  technical: 'Técnico',
  tactical: 'Táctico',
  psychological: 'Mental',
}

function format(value: number | null, isPercent = false): string {
  if (value === null) return '—'
  return isPercent ? String(value) : value.toFixed(1)
}

function shareOfA(a: number | null, b: number | null): number | null {
  if (a === null || b === null || a + b === 0) return null
  return (a / (a + b)) * 100
}

const VALUE_CLASS = 'w-12 text-center text-base font-semibold text-gray-700 tabular-nums'

function ComparisonRow({ label, a, b, isPercent, showTeams = false }: StatRow & { showTeams?: boolean }) {
  const share = shareOfA(a, b)
  return (
    <li>
      {showTeams && (
        <div aria-hidden className="mb-1 flex justify-between text-sm font-semibold sm:hidden">
          <span className="text-primary">Equipo A</span>
          <span className="text-orange-700">Equipo B</span>
        </div>
      )}
      <div
        aria-hidden
        className="grid grid-cols-1 items-baseline gap-6 text-sm sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
      >
        <span className="truncate text-right font-semibold text-primary max-sm:hidden">{showTeams && 'Equipo A'}</span>
        <span className="truncate text-center font-bold text-gray-800">{label}</span>
        <span className="truncate text-left font-semibold text-orange-700 max-sm:hidden">
          {showTeams && 'Equipo B'}
        </span>
      </div>
      <div aria-hidden className="mt-0.5 flex items-center gap-3">
        <span className={VALUE_CLASS}>{format(a, isPercent)}</span>
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-secondary/40">
          {share === null ? (
            <div className="h-full w-full bg-gray-200" />
          ) : (
            <div className="bg-primary-gradient h-full" style={{ width: `${share}%` }} />
          )}
        </div>
        <span className={VALUE_CLASS}>{format(b, isPercent)}</span>
      </div>
      <span className="sr-only">
        {label}: Equipo A {format(a, isPercent)}
        {isPercent ? '%' : ''}, Equipo B {format(b, isPercent)}
        {isPercent ? '%' : ''}
      </span>
    </li>
  )
}

export default function MatchStatsSection({ teamA, teamB, className = '' }: Props) {
  const rows: StatRow[] = [
    {
      key: 'win',
      label: 'Prob. de victoria',
      a: teamA.winProbability,
      b: teamB.winProbability,
      isPercent: true,
    },
    ...SKILL_KEYS.map((key) => ({ key, label: SKILL_LABELS[key], a: teamA.skills[key], b: teamB.skills[key] })),
  ]
  return (
    <DetailSection id="match-stats-title" title="Estadísticas" icon={ChartBarIcon} className={className}>
      <ul className="space-y-2.5">
        {rows.map((row, index) => (
          <ComparisonRow {...row} key={row.key} showTeams={index === 0} />
        ))}
      </ul>
    </DetailSection>
  )
}
