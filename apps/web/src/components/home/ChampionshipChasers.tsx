import { CHAMPIONSHIP_THRESHOLD, type StreakLeader } from '@fulbito/utils'
import ChampionshipTrack from './ChampionshipTrack'
import PlayerAvatar from './PlayerAvatar'

export default function ChampionshipChasers({ chasers }: { chasers: StreakLeader[] }) {
  if (chasers.length === 0) return null
  return (
    <div className="border-t border-gray-100 pt-4">
      <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-600 uppercase">Lo persiguen</h3>
      <ul className="space-y-3">
        {chasers.map((c) => (
          <li key={c.playerId} className="flex min-h-11 items-center gap-3">
            <PlayerAvatar name={c.playerName} photoUrl={c.playerPhotoUrl} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium text-gray-900">{c.playerName}</span>
                <span className="shrink-0 text-xs font-semibold text-gray-600">{c.count} seguidas</span>
              </div>
              <ChampionshipTrack
                streak={c.count}
                label={`${c.playerName}: ${Math.min(c.count, CHAMPIONSHIP_THRESHOLD)} de ${CHAMPIONSHIP_THRESHOLD} victorias`}
                size="sm"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
