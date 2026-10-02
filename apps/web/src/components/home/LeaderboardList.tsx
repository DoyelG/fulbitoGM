import type { RankedStat } from '@fulbito/utils'
import PlayerAvatar from './PlayerAvatar'

export type LeaderboardListProps = {
  entries: RankedStat[]
  singular: string
  plural: string
  pillClass: string
  featuredClass: string
  valueClass: string
  featuredLabel: string
  emptyText: string
}

export default function LeaderboardList({
  entries,
  singular,
  plural,
  pillClass,
  featuredClass,
  valueClass,
  featuredLabel,
  emptyText,
}: LeaderboardListProps) {
  if (entries.length === 0) return <p className="text-sm text-gray-600">{emptyText}</p>
  const [top, ...rest] = entries
  const unit = (value: number) => (value === 1 ? singular : plural)

  return (
    <ol className="space-y-1">
      <li className={`mb-2 flex min-w-0 items-center gap-3 rounded-xl bg-gradient-to-br p-3 ${featuredClass}`}>
        <PlayerAvatar name={top.playerName} photoUrl={top.playerPhotoUrl} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-gray-900">{top.playerName}</p>
          <p className="text-xs font-semibold text-gray-700">
            <span aria-hidden>🥇 </span>
            {featuredLabel}
          </p>
        </div>
        <p className="shrink-0 text-right leading-none">
          <span className={`block text-4xl font-black tabular-nums ${valueClass}`}>{top.value}</span>
          <span className="text-xs font-semibold text-gray-700">{unit(top.value)}</span>
        </p>
      </li>
      {rest.map((e) => (
        <li
          key={e.playerId}
          className="flex min-h-11 items-center gap-3 border-t border-gray-100 py-1.5 first:border-t-0"
        >
          <span className="w-5 shrink-0 text-center text-sm font-bold text-gray-500 tabular-nums">{e.rank}</span>
          <PlayerAvatar name={e.playerName} photoUrl={e.playerPhotoUrl} />
          <span className="min-w-0 truncate font-medium text-gray-900">{e.playerName}</span>
          <span className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${pillClass}`}>
            {e.value} {unit(e.value)}
          </span>
        </li>
      ))}
    </ol>
  )
}
