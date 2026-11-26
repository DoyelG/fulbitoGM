'use client'

import type { ReactNode } from 'react'
import type { Match, MatchPlayer } from '@fulbito/types'
import { getMatchMvpName, getTeamScorers } from '@fulbito/utils'
import { usePlayerStore } from '@/store/usePlayerStore'
import MatchPitch from './MatchPitch'
import PlayerAvatar from './PlayerAvatar'

type TeamColumnProps = { label: string; isWinner: boolean; align: 'left' | 'right' }

const BADGE =
  'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full bg-white/10 py-1 pr-3 text-sm font-medium text-gray-100'

function TeamColumn({ label, isWinner, align }: TeamColumnProps) {
  return (
    <div className={`min-w-0 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <p className={`truncate text-sm font-bold sm:text-lg ${isWinner ? 'text-orange-300' : 'text-white'}`}>{label}</p>
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

export type ScoreboardResultProps = { match: Match; action?: ReactNode }

export default function ScoreboardResult({ match, action }: ScoreboardResultProps) {
  const { teamAScore: a, teamBScore: b } = match
  const shirtsPlayer = usePlayerStore((state) =>
    match.shirtsResponsibleId ? state.players.find((player) => player.id === match.shirtsResponsibleId) : undefined,
  )
  const mvpPlayer = usePlayerStore((state) =>
    match.mvpId ? state.players.find((player) => player.id === match.mvpId) : undefined,
  )
  const mvpName = getMatchMvpName(match)

  return (
    <div>
      <p className="sr-only">
        {srResult(a, b)}
        {srScorers('Equipo A', getTeamScorers(match.teamA))}
        {srScorers('Equipo B', getTeamScorers(match.teamB))}
      </p>
      <div aria-hidden className="mx-auto max-w-2xl">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 sm:gap-x-8">
          <TeamColumn label="Equipo A" isWinner={a > b} align="right" />
          <p className="text-glow-primary text-5xl leading-none font-black tabular-nums sm:text-[3.5rem]">
            {a}
            <span className="mx-2 text-white/35">:</span>
            {b}
          </p>
          <TeamColumn label="Equipo B" isWinner={b > a} align="left" />
        </div>
      </div>
      <MatchPitch
        className="mt-4"
        wide
        teamA={match.teamA}
        teamB={match.teamB}
        mvpId={match.mvpId}
        goalkeeperIds={match.goalkeeperIds}
      />
      {(mvpName || shirtsPlayer || action) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {mvpName && (
            <p className={`${BADGE} pl-1`}>
              <PlayerAvatar name={mvpName} photoUrl={mvpPlayer?.photoUrl} onDark />
              <span aria-hidden>⭐</span>
              <span className="truncate">MVP {mvpName}</span>
            </p>
          )}
          {shirtsPlayer && (
            <p className={`${BADGE} pl-1`}>
              <PlayerAvatar name={shirtsPlayer.name} photoUrl={shirtsPlayer.photoUrl} onDark />
              <span aria-hidden>👕</span>
              <span className="truncate">Utilero: {shirtsPlayer.name}</span>
            </p>
          )}
          {action}
        </div>
      )}
    </div>
  )
}
