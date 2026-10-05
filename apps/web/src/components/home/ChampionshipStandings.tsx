import { CHAMPIONSHIP_THRESHOLD } from '@fulbito/utils'
import ChampionshipTrack from './ChampionshipTrack'
import PlayerAvatar from './PlayerAvatar'

export type StandingRow = {
  playerId: string
  playerName: string
  playerPhotoUrl?: string
  streak: number
}

function winsLabel(name: string, streak: number): string {
  return `${name}: ${Math.min(streak, CHAMPIONSHIP_THRESHOLD)} de ${CHAMPIONSHIP_THRESHOLD} victorias`
}

function PositionBadge({ position, isLeader }: { position: number; isLeader: boolean }) {
  return (
    <span
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-black tabular-nums ${
        isLeader ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
      }`}
    >
      {position}°
    </span>
  )
}

export default function ChampionshipStandings({ rows }: { rows: StandingRow[] }) {
  if (rows.length === 0) return null
  const [leader, ...rest] = rows

  return (
    <div className="space-y-3">
      <div className="flex text-[11px] font-bold tracking-wider text-gray-500 uppercase">
        <span className="w-10">Pos</span>
        <span className="flex-1">Jugador</span>
        <span>Racha</span>
      </div>
      <ol aria-label="Posiciones de la carrera" className="space-y-1">
        <li className="flex min-w-0 items-center gap-3 rounded-r-xl border-l-4 border-emerald-500 bg-emerald-50 py-3 pr-3 pl-2">
          <PositionBadge position={1} isLeader />
          <PlayerAvatar name={leader.playerName} photoUrl={leader.playerPhotoUrl} size="md" />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="truncate text-lg leading-tight font-bold text-gray-900">{leader.playerName}</p>
            <ChampionshipTrack
              streak={leader.streak}
              label={winsLabel(leader.playerName, leader.streak)}
              size="sm"
              tone="champion"
            />
          </div>
          <p aria-hidden className="shrink-0 leading-none">
            <span className="text-3xl font-black text-emerald-700 tabular-nums">
              {Math.min(leader.streak, CHAMPIONSHIP_THRESHOLD)}
            </span>
            <span className="text-base font-bold text-gray-600">/{CHAMPIONSHIP_THRESHOLD}</span>
          </p>
        </li>
        {rest.map((row, i) => (
          <li
            key={row.playerId}
            className="flex min-h-14 min-w-0 items-center gap-3 border-b border-gray-100 py-2 pr-3 pl-3 last:border-b-0"
          >
            <PositionBadge position={i + 2} isLeader={false} />
            <PlayerAvatar name={row.playerName} photoUrl={row.playerPhotoUrl} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="truncate font-medium text-gray-900">{row.playerName}</p>
              <ChampionshipTrack streak={row.streak} label={winsLabel(row.playerName, row.streak)} size="sm" />
            </div>
            <span aria-hidden className="shrink-0 text-sm font-bold text-gray-700 tabular-nums">
              {Math.min(row.streak, CHAMPIONSHIP_THRESHOLD)}/{CHAMPIONSHIP_THRESHOLD}
            </span>
          </li>
        ))}
      </ol>
      <p className="flex items-center gap-2 text-xs text-gray-600">
        <span aria-hidden className="h-3 w-1 rounded-full bg-emerald-500" />
        Zona de campeonato: {CHAMPIONSHIP_THRESHOLD} victorias seguidas
      </p>
    </div>
  )
}
