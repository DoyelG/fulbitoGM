import type { Match, MatchPlayer, Player } from '@fulbito/types'
import Link from 'next/link'
import { formatMatchHour, parseMatchDate } from '@fulbito/utils'
import { CalendarIcon, ClockIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { FaTshirt } from 'react-icons/fa'
import { GiGoalKeeper } from 'react-icons/gi'
import MatchLocationLink from '@/components/MatchLocationLink'
import DetailSection from './DetailSection'

type Props = {
  match: Match | null
  today: string
  playerById: Map<string, Player>
}

const DAY_IN_MS = 24 * 60 * 60 * 1000
const UNKNOWN_SKILL = 5
const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'short', timeZone: 'UTC' })
const longMonthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', timeZone: 'UTC' })
const weekdayFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'long', timeZone: 'UTC' })

function daysUntil(day: string, today: string): number {
  return Math.round((Date.parse(`${day}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_IN_MS)
}

function countdownLabel(days: number): string {
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  return `En ${days} días`
}

function teamTotals(players: MatchPlayer[], playerById: Map<string, Player>): { skill: number; physical: number } {
  return players.reduce(
    (totals, player) => {
      const info = playerById.get(player.id)
      const physical = info?.skills?.physical
      return {
        skill: totals.skill + (info?.skill ?? UNKNOWN_SKILL),
        physical: totals.physical + (typeof physical === 'number' ? physical : UNKNOWN_SKILL),
      }
    },
    { skill: 0, physical: 0 },
  )
}

function TeamStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1 text-gray-900" title={label}>
      <dt>
        <span aria-hidden>{icon}</span>
        <span className="sr-only">{label}</span>
      </dt>
      <dd>{value}</dd>
    </div>
  )
}

type TeamPreviewProps = {
  title: string
  players: MatchPlayer[]
  skill: number
  physical: number
  winProbability: number
  goalkeeperIds: Set<string>
  color: 'blue' | 'red'
}

function TeamPreview({ title, players, skill, physical, winProbability, goalkeeperIds, color }: TeamPreviewProps) {
  return (
    <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className={`mb-3 text-center font-semibold ${color === 'blue' ? 'text-blue-700' : 'text-red-700'}`}>
        {title}
      </h3>
      {players.length === 0 ? (
        <p className="mb-3 text-center text-sm italic text-gray-700">Sin jugadores</p>
      ) : (
        <ul className="mb-3 grid gap-2">
          {players.map((player) => (
            <li key={player.id}>
              <Link
                href={`/players/${player.id}`}
                className="block rounded bg-gray-50 px-3 py-2 text-center transition-colors hover:bg-gray-100 hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <strong>{player.name}</strong>
                {goalkeeperIds.has(player.id) && (
                  <span className="ml-2" title="Arquero">
                    <GiGoalKeeper className="inline h-4 w-4 text-gray-700" aria-hidden />
                    <span className="sr-only">(arquero)</span>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <dl className="flex flex-wrap justify-center gap-x-5 gap-y-1 rounded bg-gray-100 px-3 py-2 text-sm font-semibold">
        <TeamStat icon="🧠" label="Total habilidad" value={String(skill)} />
        <TeamStat icon="💪" label="Total físico" value={String(physical)} />
        <TeamStat icon="🏆" label="Probabilidad de victoria" value={`${winProbability}%`} />
      </dl>
    </div>
  )
}

export default function NextMatchPanel({ match, today, playerById }: Props) {
  if (!match) {
    return (
      <DetailSection id="next-match-title" title="Próximo partido" icon={CalendarIcon}>
        <p className="text-sm italic text-gray-700">Todavía no hay un próximo partido definido.</p>
      </DetailSection>
    )
  }

  const { date, hour } = parseMatchDate(match)
  const matchDay = new Date(`${date}T00:00:00Z`)
  const playersCount = match.teamA.length + match.teamB.length
  const goalkeeperIds = new Set(match.goalkeeperIds ?? [])
  const totalsA = teamTotals(match.teamA, playerById)
  const totalsB = teamTotals(match.teamB, playerById)
  const combinedSkill = totalsA.skill + totalsB.skill
  const probabilityA = combinedSkill > 0 ? Math.round((totalsA.skill / combinedSkill) * 100) : 50
  const shirtsName = match.shirtsResponsibleId ? playerById.get(match.shirtsResponsibleId)?.name : undefined

  return (
    <DetailSection
      id="next-match-title"
      title="Próximo partido"
      icon={CalendarIcon}
      action={{ label: 'Ver historial', href: '/history' }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <p className="rounded-xl border border-brand/30 px-3 py-2 text-center text-base font-semibold text-gray-900 sm:hidden">
          <span className="capitalize">{weekdayFormatter.format(matchDay)}</span> {matchDay.getUTCDate()} de{' '}
          {longMonthFormatter.format(matchDay)}
        </p>
        <div
          className="hidden w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-brand/30 px-2 py-1 text-brand sm:flex"
          aria-hidden
        >
          <span className="text-[11px] font-semibold uppercase leading-tight">
            {monthFormatter.format(matchDay).replace('.', '')}
          </span>
          <span className="text-2xl font-bold leading-none text-gray-900">{matchDay.getUTCDate()}</span>
          <span className="text-[11px] capitalize leading-tight text-gray-700">
            {weekdayFormatter.format(matchDay)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-gray-900">{match.name || 'Partido'}</p>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-orange-800">
              {countdownLabel(daysUntil(date, today))}
            </span>
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-800">
            {hour !== null && (
              <li className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-gray-500" aria-hidden />
                {formatMatchHour(hour)}
              </li>
            )}
            {match.location && (
              <li className="flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4 text-gray-500" aria-hidden />
                <MatchLocationLink location={match.location} />
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <UserGroupIcon className="h-4 w-4 text-gray-500" aria-hidden />
              {match.type} · {playersCount} {playersCount === 1 ? 'confirmado' : 'confirmados'}
            </li>
            <li className="flex items-center gap-1.5">
              <FaTshirt className="h-4 w-4 text-gray-500" aria-hidden />
              <span>
                Lava las remeras:{' '}
                {shirtsName ? (
                  <span className="font-semibold text-gray-900">{shirtsName}</span>
                ) : (
                  <span className="italic text-gray-700">sin asignar</span>
                )}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <TeamPreview
          title="Team A"
          players={match.teamA}
          skill={totalsA.skill}
          physical={totalsA.physical}
          winProbability={probabilityA}
          goalkeeperIds={goalkeeperIds}
          color="blue"
        />
        <TeamPreview
          title="Team B"
          players={match.teamB}
          skill={totalsB.skill}
          physical={totalsB.physical}
          winProbability={100 - probabilityA}
          goalkeeperIds={goalkeeperIds}
          color="red"
        />
      </div>
    </DetailSection>
  )
}
