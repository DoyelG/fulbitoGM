import type { Match } from '@fulbito/types'
import { getMatchMvpName, getMatchScorers, summarizeTeam } from '@fulbito/utils'

type TeamColumnProps = { label: string; summary: string; isWinner: boolean }

function TeamColumn({ label, summary, isWinner }: TeamColumnProps) {
  return (
    <div className="min-w-0">
      <p className={`truncate text-sm font-bold sm:text-lg ${isWinner ? 'text-orange-300' : 'text-white'}`}>{label}</p>
      <p className="hidden truncate text-xs text-gray-300 sm:block">{summary}</p>
    </div>
  )
}

function srSummary(a: number, b: number): string {
  if (a === b) return `Empate ${a} a ${b}`
  return a > b ? `Ganó Equipo A ${a} a ${b}` : `Ganó Equipo B ${b} a ${a}`
}

export default function ScoreboardResult({ match }: { match: Match }) {
  const { teamAScore: a, teamBScore: b } = match
  const mvpName = getMatchMvpName(match)
  const scorers = getMatchScorers(match)
  const details = [
    mvpName ? { icon: '⭐', text: `MVP ${mvpName}` } : null,
    scorers.length > 0
      ? { icon: '⚽', text: scorers.map((p) => (p.goals > 1 ? `${p.name} ×${p.goals}` : p.name)).join(', ') }
      : null,
  ].filter((d) => d !== null)

  return (
    <div>
      <p className="sr-only">{srSummary(a, b)}</p>
      <div aria-hidden className="mx-auto grid max-w-2xl grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
        <TeamColumn label="Equipo A" summary={summarizeTeam(match.teamA)} isWinner={a > b} />
        <p className="text-glow-brand text-5xl leading-none font-black tabular-nums sm:text-7xl">
          {a}
          <span className="mx-2 text-white/35">:</span>
          {b}
        </p>
        <TeamColumn label="Equipo B" summary={summarizeTeam(match.teamB)} isWinner={b > a} />
      </div>
      {details.length > 0 && (
        <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-300">
          {details.map((d, i) => (
            <span key={d.icon}>
              {i > 0 && <span aria-hidden> · </span>}
              <span aria-hidden>{d.icon} </span>
              {d.text}
            </span>
          ))}
        </p>
      )}
    </div>
  )
}
