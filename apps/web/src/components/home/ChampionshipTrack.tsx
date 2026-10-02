import { CHAMPIONSHIP_THRESHOLD } from '@fulbito/utils'

export default function ChampionshipTrack({ streak, label }: { streak: number; label: string }) {
  const filled = Math.min(streak, CHAMPIONSHIP_THRESHOLD)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={CHAMPIONSHIP_THRESHOLD}
      aria-valuenow={filled}
      className="flex gap-1.5"
    >
      {Array.from({ length: CHAMPIONSHIP_THRESHOLD }, (_, i) => (
        <span key={i} className={`h-2.5 flex-1 rounded-full ${i < filled ? 'bg-brand' : 'bg-brand/15'}`} />
      ))}
    </div>
  )
}
