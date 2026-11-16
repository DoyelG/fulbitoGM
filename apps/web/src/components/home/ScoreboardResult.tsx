import type { Match, MatchPlayer } from '@fulbito/types'
import { getMatchMvpName, getTeamScorers, summarizeTeam } from '@fulbito/utils'
import TeamScorers from './TeamScorers'

type TeamColumnProps = { label: string; summary: string; isWinner: boolean }

function TeamColumn({ label, summary, isWinner }: TeamColumnProps) {
  return (
    <div className="min-w-0">
      <p className={`truncate text-sm font-bold sm:text-lg ${isWinner ? 'text-orange-300' : 'text-white'}`}>{label}</p>
      <p className="hidden truncate text-xs text-gray-300 sm:block">{summary}</p>
    </div>
  )
}

function srResult(a: number, b: number): string {
  if (a === b) return `Empate ${a} a ${b}`
  return a > b ? `Ganó Equipo A ${a} a ${b}` : `Ganó Equipo B ${b} a ${a}`
}

function srScorers(label: string, scorers: MatchPlayer[]): string {
  if (scorers.length === 0) return ''
  const list = scorers.map((p) => `${p.name} ${p.goals === 1 ? '1 gol' : `${p.goals} goles`}`).join(', ')
  return ` Goles de ${label}: ${list}.`
}

export default function ScoreboardResult({ match }: { match: Match }) {
  const { teamAScore: a, teamBScore: b } = match
  const mvpName = getMatchMvpName(match)
  const scorersA = getTeamScorers(match.teamA)
  const scorersB = getTeamScorers(match.teamB)
  const hasScorers = scorersA.length > 0 || scorersB.length > 0

  return (
    <div>
      <p className="sr-only">
        {srResult(a, b)}
        {srScorers('Equipo A', scorersA)}
        {srScorers('Equipo B', scorersB)}
      </p>
      <div aria-hidden className="mx-auto max-w-2xl">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 sm:gap-x-8">
          <TeamColumn label="Equipo A" summary={summarizeTeam(match.teamA)} isWinner={a > b} />
          <p className="text-glow-primary text-5xl leading-none font-black tabular-nums sm:text-7xl">
            {a}
            <span className="mx-2 text-white/35">:</span>
            {b}
          </p>
          <TeamColumn label="Equipo B" summary={summarizeTeam(match.teamB)} isWinner={b > a} />
        </div>
        {hasScorers && (
          <div className="mt-5 grid grid-cols-2 gap-x-3 border-t border-white/10 pt-4 sm:gap-x-8">
            <div>
              <TeamScorers scorers={scorersA} />
            </div>
            <div>
              <TeamScorers scorers={scorersB} />
            </div>
          </div>
        )}
      </div>
      {mvpName && (
        <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-gray-100">
          <span aria-hidden>⭐</span>
          MVP {mvpName}
        </p>
      )}
    </div>
  )
}
