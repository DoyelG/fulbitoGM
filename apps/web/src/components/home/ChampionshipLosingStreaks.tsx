import type { StreakLeader } from '@fulbito/utils'
import ChampionshipTrack from './ChampionshipTrack'
import PlayerAvatar from './PlayerAvatar'

export default function ChampionshipLosingStreaks({ streaks }: { streaks: StreakLeader[] }) {
  if (streaks.length === 0) return null
  return (
    <div className="border-t border-gray-100 pt-3">
      <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-600 uppercase">Las rachas negativas</h3>
      <ul className="space-y-1.5">
        {streaks.map((streak) => (
          <li key={streak.playerId} className="flex items-center gap-3">
            <PlayerAvatar name={streak.playerName} photoUrl={streak.playerPhotoUrl} />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium text-gray-900">{streak.playerName}</span>
                <span className="shrink-0 text-xs font-semibold text-orange-800">
                  {streak.count === 1 ? '1 derrota' : `${streak.count} derrotas`}
                </span>
              </div>
              <ChampionshipTrack
                streak={streak.count}
                label={`${streak.playerName}: ${streak.count} ${streak.count === 1 ? 'derrota seguida' : 'derrotas seguidas'}`}
                size="sm"
                tone="loss"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
