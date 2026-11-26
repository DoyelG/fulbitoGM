import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { PitchPosition } from '@fulbito/types'
import type { PitchDragHandlers } from '@/hooks/use-pitch-drag'
import GoalBalls from './GoalBalls'
import PlayerAvatar, { type PlayerAvatarProps } from './PlayerAvatar'
import PitchTooltip, { type PitchTooltipData } from './PitchTooltip'

export type PitchDensity = {
  avatar: NonNullable<PlayerAvatarProps['size']>
  nameClass: string
  maxChars?: number
  compactBalls: boolean
}

type Props = {
  playerId: string
  tooltipId: string
  name: string
  photoUrl?: string | null
  goals: number
  side: 'A' | 'B'
  isMvp: boolean
  spot: PitchPosition
  density: PitchDensity
  tooltip: PitchTooltipData
  drag?: PitchDragHandlers & { isDragging: boolean; describedBy: string }
}

const FOCUS = 'rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

function shortName(name: string, maxChars?: number): string {
  if (!maxChars || name.length <= maxChars) return name
  return `${name.slice(0, maxChars - 1).trimEnd()}…`
}

function ringClass(isMvp: boolean, side: 'A' | 'B'): string {
  if (isMvp) return 'ring-3 ring-secondary'
  return side === 'A' ? 'ring-2 ring-orange-300' : ''
}

export default function PitchPlayer({
  playerId,
  tooltipId,
  name,
  photoUrl,
  goals,
  side,
  isMvp,
  spot,
  density,
  tooltip,
  drag,
}: Props) {
  const style = { '--pitch-x': `${spot.x}%`, '--pitch-y': `${spot.y}%` } as CSSProperties

  const body = (
    <>
      <span className={`relative rounded-full ${ringClass(isMvp, side)}`}>
        <PlayerAvatar name={name} photoUrl={photoUrl} size={density.avatar} onDark />
        {isMvp && (
          <span role="img" aria-label="MVP" className="absolute -top-2.5 -right-2.5 text-base leading-none">
            ⭐
          </span>
        )}
      </span>
      <span
        className={`flex items-center gap-1 leading-4 font-semibold whitespace-nowrap text-white ${density.nameClass}`}
      >
        <span className="truncate">{shortName(name, density.maxChars)}</span>
        <GoalBalls goals={goals} compact={density.compactBalls} />
      </span>
    </>
  )

  const content = 'flex flex-col items-center gap-[3px]'

  return (
    <li
      style={style}
      className={`group absolute top-(--pitch-x) left-(--pitch-y) -translate-x-1/2 -translate-y-1/2 hover:z-20 focus-within:z-20 sm:top-(--pitch-y) sm:left-(--pitch-x) ${drag?.isDragging ? 'z-20' : 'z-10'}`}
    >
      {drag ? (
        <button
          type="button"
          aria-label={`Mover a ${name}`}
          aria-describedby={`${drag.describedBy} ${tooltipId}`}
          onPointerDown={drag.onPointerDown}
          onPointerMove={drag.onPointerMove}
          onPointerUp={drag.onPointerUp}
          onPointerCancel={drag.onPointerCancel}
          onKeyDown={drag.onKeyDown}
          onDragStart={(event) => event.preventDefault()}
          className={`${content} ${FOCUS} touch-none select-none [&_img]:pointer-events-none ${drag.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {body}
        </button>
      ) : (
        <Link href={`/players/${playerId}`} aria-describedby={tooltipId} className={`${content} ${FOCUS}`}>
          {body}
        </Link>
      )}
      {!drag?.isDragging && <PitchTooltip id={tooltipId} data={tooltip} spot={spot} />}
    </li>
  )
}
