import Link from 'next/link'
import type { MatchPlayer } from '@fulbito/types'
import { oneDecimal, type TeamTotals } from '@fulbito/utils'

export type TeamResult = 'win' | 'loss' | 'draw'

type Props = {
  title: string
  players: MatchPlayer[]
  isDraft: boolean
  result: TeamResult | null
  goalkeeperIds: Set<string>
  mvpId: string | null
  totals: TeamTotals
  winProbability: number
  tone: 'primary' | 'secondary'
}

type FooterStat = { icon: string; label: string; value: string }

const RESULT_LABELS: Record<TeamResult, string> = { win: 'Ganó', loss: 'Perdió', draw: 'Empate' }
const RESULT_STYLES: Record<TeamResult, string> = {
  win: 'bg-primary/10 text-primary',
  loss: 'bg-secondary/15 text-orange-800',
  draw: 'bg-gray-100 text-gray-700',
}

function footerStats({ isDraft, players, totals, winProbability }: Props): FooterStat[] {
  if (isDraft) {
    return [
      { icon: '🧠', label: 'Total habilidad', value: String(oneDecimal(totals.skill)) },
      { icon: '💪', label: 'Total físico', value: String(oneDecimal(totals.physical)) },
      { icon: '🏆', label: 'Probabilidad de victoria', value: `${winProbability}%` },
    ]
  }
  const goals = players.reduce((sum, player) => sum + player.goals, 0)
  const rated = players.filter((player) => player.performance > 0)
  const average = rated.length ? rated.reduce((sum, player) => sum + player.performance, 0) / rated.length : 0
  return [
    { icon: '⚽', label: 'Goles', value: String(goals) },
    { icon: '⭐', label: 'Rendimiento promedio', value: rated.length ? String(oneDecimal(average)) : '—' },
  ]
}

export default function MatchTeamCard(props: Props) {
  const { title, players, isDraft, result, goalkeeperIds, mvpId, tone } = props

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-center gap-2">
        <h3 className={`text-center font-semibold ${tone === 'primary' ? 'text-primary' : 'text-orange-700'}`}>
          {title}
        </h3>
        {result && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${RESULT_STYLES[result]}`}>
            {RESULT_LABELS[result]}
          </span>
        )}
      </div>
      {players.length === 0 ? (
        <p className="mb-3 text-center text-sm italic text-gray-700">Sin jugadores</p>
      ) : (
        <ul className="mb-3 grid gap-2">
          {players.map((player) => (
            <li key={player.id}>
              <Link
                href={`/players/${player.id}`}
                className="flex min-h-10 items-center gap-2 rounded bg-gray-50 px-3 py-2 transition-colors hover:bg-gray-100 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className={`min-w-0 flex-1 truncate ${isDraft ? 'text-center' : ''}`}>
                  <strong>{player.name}</strong>
                  {goalkeeperIds.has(player.id) && (
                    <span className="ml-1.5" title="Arquero" role="img" aria-label="Arquero">
                      🧤
                    </span>
                  )}
                  {!isDraft && mvpId === player.id && (
                    <span className="ml-1.5" title="MVP" role="img" aria-label="MVP">
                      🏆
                    </span>
                  )}
                </span>
                {!isDraft && (
                  <span className="flex shrink-0 items-center gap-3 text-sm tabular-nums text-gray-700">
                    <span aria-label={`${player.goals} goles`}>{player.goals} ⚽</span>
                    <span aria-label={`Rendimiento ${player.performance}`}>{player.performance} ⭐</span>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-auto flex flex-wrap justify-center gap-x-5 gap-y-1 rounded bg-gray-100 px-3 py-2 text-sm font-semibold">
        {footerStats(props).map((stat) => (
          <div key={stat.label} className="flex items-center gap-1 text-gray-900" title={stat.label}>
            <dt>
              <span aria-hidden>{stat.icon}</span>
              <span className="sr-only">{stat.label}</span>
            </dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
