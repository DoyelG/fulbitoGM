import type { CSSProperties } from 'react'
import type { PitchPosition } from '@fulbito/types'

type Props = { spots: PitchPosition[]; className: string }

export default function PitchGuideSpots({ spots, className }: Props) {
  if (spots.length === 0) return null
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      {spots.map((spot) => (
        <span
          key={`${spot.x}-${spot.y}`}
          style={{ '--pitch-x': `${spot.x}%`, '--pitch-y': `${spot.y}%` } as CSSProperties}
          className="absolute top-(--pitch-x) left-(--pitch-y) h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-white/35 sm:top-(--pitch-y) sm:left-(--pitch-x)"
        />
      ))}
    </div>
  )
}
