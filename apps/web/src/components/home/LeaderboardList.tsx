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
      <li className="mb-3 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-100 to-amber-500 p-[3px] shadow-md">
        <div
          className={`relative flex min-w-0 items-center gap-4 overflow-hidden rounded-[13px] bg-gradient-to-br p-3 ${featuredClass}`}
        >
          <span className="absolute top-0 left-0 rounded-br-lg bg-amber-400 px-2 py-0.5 text-[10px] font-black tracking-wider text-gray-900 uppercase">
            #1
          </span>
          <div className="mt-3 shrink-0 rounded-xl bg-white p-1 shadow-sm ring-1 ring-amber-300">
            <PlayerAvatar name={top.playerName} photoUrl={top.playerPhotoUrl} size="lg" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg leading-tight font-black text-gray-900 uppercase">{top.playerName}</p>
            <p className="mt-1 text-xs font-semibold text-gray-700">
              <span aria-hidden>🥇 </span>
              {featuredLabel}
            </p>
          </div>
          <p className="shrink-0 text-center leading-none">
            <span className={`block text-5xl font-black tracking-tight tabular-nums ${valueClass}`}>{top.value}</span>
            <span className="text-[11px] font-bold tracking-wider text-gray-700 uppercase">{unit(top.value)}</span>
          </p>
        </div>
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
