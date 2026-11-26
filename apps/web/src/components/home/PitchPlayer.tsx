import Link from 'next/link'
import { useRef, type CSSProperties, type PointerEvent } from 'react'
import type { PitchPosition } from '@fulbito/types'
import type { PitchDragHandlers } from '@/hooks/use-pitch-drag'
import GoalBalls from './GoalBalls'
import PlayerAvatar, { type PlayerAvatarProps } from './PlayerAvatar'
import PitchTooltip, { type PitchTooltipData } from './PitchTooltip'

export type PitchDensity = {
  avatar: NonNullable<PlayerAvatarProps['size']>
  nameClass: string
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
  tooltipOpen: boolean
  onHoverChange: (hovering: boolean) => void
  onFocusChange: (focused: boolean) => void
  onTap: () => void
  drag?: PitchDragHandlers & { isDragging: boolean; describedBy: string }
}

const TAP_SLOP = 8

const FOCUS = 'rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

function ringClass(isMvp: boolean, side: 'A' | 'B'): string {
  if (isMvp) return 'ring-3 ring-secondary'
  return side === 'A' ? 'ring-2 ring-orange-300' : ''
}

function isTap(press: { x: number; y: number } | null, event: PointerEvent<HTMLElement>): boolean {
  return press !== null && Math.hypot(event.clientX - press.x, event.clientY - press.y) <= TAP_SLOP
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
  tooltipOpen,
  onHoverChange,
  onFocusChange,
  onTap,
  drag,
}: Props) {
  const pressRef = useRef<{ x: number; y: number } | null>(null)
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
        {goals > 0 && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] leading-none whitespace-nowrap">
            <GoalBalls goals={goals} compact={density.compactBalls} />
          </span>
        )}
      </span>
      <span className={`line-clamp-2 text-center leading-4 font-semibold break-words text-white ${density.nameClass}`}>
        {name}
      </span>
    </>
  )

  const content = 'flex flex-col items-center gap-[3px]'

  return (
    <li
      style={style}
      data-pitch-player={playerId}
      onPointerEnter={(event) => event.pointerType === 'mouse' && onHoverChange(true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && onHoverChange(false)}
      onPointerDown={(event) => {
        pressRef.current = event.pointerType === 'mouse' ? null : { x: event.clientX, y: event.clientY }
      }}
      onPointerUp={(event) => {
        if (isTap(pressRef.current, event)) onTap()
        pressRef.current = null
      }}
      onFocus={() => onFocusChange(true)}
      onBlur={() => onFocusChange(false)}
      className={`absolute w-max top-(--pitch-x) left-(--pitch-y) -translate-x-1/2 -translate-y-1/2 sm:top-(--pitch-y) sm:left-(--pitch-x) ${drag?.isDragging || tooltipOpen ? 'z-20' : 'z-10'}`}
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
      {!drag?.isDragging && (
        <PitchTooltip id={tooltipId} data={tooltip} spot={spot} open={tooltipOpen} href={`/players/${playerId}`} />
      )}
    </li>
  )
}
