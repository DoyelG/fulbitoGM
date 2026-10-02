import type { StreakLeader } from '@fulbito/utils'
import PlayerAvatar from './PlayerAvatar'

export type StreakGroupProps = {
  title: string
  kind: 'win' | 'loss'
  leaders: StreakLeader[]
}

const PILL_CLASS = {
  win: 'bg-orange-100 text-orange-800',
  loss: 'bg-sky-100 text-sky-800',
}

export default function StreakGroup({ title, kind, leaders }: StreakGroupProps) {
  if (leaders.length === 0) return null
  return (
    <div>
      <h3 className="mb-1 text-xs font-bold tracking-wider text-gray-600 uppercase">{title}</h3>
      <ul className="divide-y divide-gray-100">
        {leaders.map((l) => (
          <li key={l.playerId} className="flex min-h-11 items-center gap-3 py-1.5">
            <PlayerAvatar name={l.playerName} photoUrl={l.playerPhotoUrl} />
            <span className="min-w-0 truncate font-medium text-gray-900">{l.playerName}</span>
            <span className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${PILL_CLASS[kind]}`}>
              {l.count} seguidas
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
