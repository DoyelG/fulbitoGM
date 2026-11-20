import type { PersonalSummary } from '@fulbito/utils'

type Props = { summary: PersonalSummary }

function streakLabel(streak: PersonalSummary['streak']): string {
  if (!streak.kind) return '—'
  return `${streak.count} ${streak.kind === 'win' ? (streak.count === 1 ? 'victoria' : 'victorias') : streak.count === 1 ? 'derrota' : 'derrotas'}`
}

export default function PersonalStatsGrid({ summary }: Props) {
  const stats = [
    { label: 'Partidos', value: summary.matches },
    { label: 'Goles', value: summary.goals },
    { label: 'Goles por partido', value: summary.goalsPerMatch },
    { label: 'Ganados', value: summary.wins },
    { label: 'Empatados', value: summary.draws },
    { label: 'Perdidos', value: summary.losses },
    { label: '% de victorias', value: `${summary.winRate}%` },
    { label: 'Rendimiento medio', value: summary.matches ? summary.avgPerformance : '—' },
    { label: 'Racha actual', value: streakLabel(summary.streak) },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map(({ label, value }) => (
        <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-700">{label}</dt>
          <dd className="mt-1 text-2xl font-black text-gray-900">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
