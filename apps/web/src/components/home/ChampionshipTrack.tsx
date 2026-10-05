import { CHAMPIONSHIP_THRESHOLD } from '@fulbito/utils'

export type ChampionshipTrackProps = {
  streak: number
  label: string
  size?: 'sm' | 'md'
  tone?: 'brand' | 'champion'
}

const SIZE_CLASS = {
  sm: { gap: 'gap-1', segment: 'h-1.5' },
  md: { gap: 'gap-1.5', segment: 'h-3' },
}

const TONE_CLASS = {
  brand: { on: 'bg-brand', off: 'bg-brand/15' },
  champion: { on: 'bg-emerald-500', off: 'bg-emerald-500/20' },
}

export default function ChampionshipTrack({ streak, label, size = 'md', tone = 'brand' }: ChampionshipTrackProps) {
  const filled = Math.min(streak, CHAMPIONSHIP_THRESHOLD)
  const { gap, segment } = SIZE_CLASS[size]
  const { on, off } = TONE_CLASS[tone]
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={CHAMPIONSHIP_THRESHOLD}
      aria-valuenow={filled}
      className={`flex ${gap}`}
    >
      {Array.from({ length: CHAMPIONSHIP_THRESHOLD }, (_, i) => (
        <span key={i} className={`${segment} flex-1 rounded-full ${i < filled ? on : off}`} />
      ))}
    </div>
  )
}
