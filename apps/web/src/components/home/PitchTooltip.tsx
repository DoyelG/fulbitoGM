import type { PitchPosition } from '@fulbito/types'

export type PitchTooltipData = {
  name: string
  position?: string
  teamLabel: string
  isMvp: boolean
  tournament?: { matches: number; goals: number; mvps: number }
  match?: { goals: number; performance: number }
}

type Props = { id: string; data: PitchTooltipData; spot: PitchPosition }

const LABEL = 'text-[10px] leading-[14px] font-bold tracking-wider text-gray-500 uppercase'

function placementClass({ x, y }: PitchPosition): string {
  const mobileVertical = x < 50 ? 'top-full mt-2' : 'bottom-full mb-2'
  const mobileSide = y < 25 ? 'left-0' : y > 75 ? 'right-0' : 'left-1/2 -translate-x-1/2'
  const desktopVertical =
    y < 50 ? 'sm:top-full sm:bottom-auto sm:mt-2 sm:mb-0' : 'sm:bottom-full sm:top-auto sm:mb-2 sm:mt-0'
  const desktopSide =
    x < 15
      ? 'sm:left-0 sm:right-auto sm:translate-x-0'
      : x > 85
        ? 'sm:right-0 sm:left-auto sm:translate-x-0'
        : 'sm:left-1/2 sm:right-auto sm:-translate-x-1/2'
  return `${mobileVertical} ${mobileSide} ${desktopVertical} ${desktopSide}`
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

function goalsLabel(goals: number): string {
  return goals === 0 ? 'sin goles' : plural(goals, 'gol', 'goles')
}

export default function PitchTooltip({ id, data, spot }: Props) {
  const subtitle =
    [data.position, data.teamLabel].filter(Boolean).join(' · ') + (data.isMvp ? ' · MVP del partido' : '')
  return (
    <span
      id={id}
      role="tooltip"
      className={`pointer-events-none invisible absolute z-30 flex w-max max-w-60 flex-col gap-0.5 rounded-xl bg-white px-3 py-2.5 text-left text-xs leading-4 text-gray-900 opacity-0 shadow-lg transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 ${placementClass(spot)}`}
    >
      <span className="text-sm font-bold">{data.name}</span>
      <span className="text-gray-600">{subtitle}</span>
      {data.tournament && (
        <>
          <span className={`mt-1 ${LABEL}`}>En el torneo</span>
          <span className="font-semibold">
            {plural(data.tournament.matches, 'partido', 'partidos')} · {plural(data.tournament.goals, 'gol', 'goles')} ·{' '}
            {data.tournament.mvps} MVP
          </span>
        </>
      )}
      {data.match && (
        <>
          <span aria-hidden className="mt-1 border-t border-gray-200" />
          <span className={`mt-1 ${LABEL}`}>Este partido</span>
          <span className="font-semibold">
            ⚽ {goalsLabel(data.match.goals)} · ⭐ {data.match.performance} de rendimiento
          </span>
        </>
      )}
    </span>
  )
}
