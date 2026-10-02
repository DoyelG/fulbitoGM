import type { RankedStat } from '@fulbito/utils'
import PlayerAvatar from './PlayerAvatar'

export type LeaderboardListProps = {
  entries: RankedStat[]
  singular: string
  plural: string
  pillClass: string
  emptyText: string
}

export default function LeaderboardList({ entries, singular, plural, pillClass, emptyText }: LeaderboardListProps) {
  if (entries.length === 0) return <p className="text-sm text-gray-600">{emptyText}</p>
  return (
    <ol className="divide-y divide-gray-100">
      {entries.map((e) => (
        <li key={e.playerId} className="flex min-h-11 items-center gap-3 py-1.5">
          <span
            className={`w-5 shrink-0 text-center text-sm font-bold tabular-nums ${e.rank === 1 ? 'text-brand' : 'text-gray-500'}`}
          >
            {e.rank}
          </span>
          <PlayerAvatar name={e.playerName} photoUrl={e.playerPhotoUrl} />
          <span className="min-w-0 truncate font-medium text-gray-900">{e.playerName}</span>
          <span className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${pillClass}`}>
            {e.value} {e.value === 1 ? singular : plural}
          </span>
        </li>
      ))}
    </ol>
  )
}
