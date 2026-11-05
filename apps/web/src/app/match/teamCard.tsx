import type { PlayerInfo, TeamResult } from '@/lib/teamUtils'

const TEAM_COLOR_STYLES = {
  brand: { title: 'text-brand' },
  accent: { title: 'text-accent' },
}

type Props = {
  title: string
  team: TeamResult
  color: keyof typeof TEAM_COLOR_STYLES
  winProbability: number
  goalkeeperIds: Set<string>
  manualIds: Set<string>
}

export default function TeamCard({ title, team, color, winProbability, goalkeeperIds, manualIds }: Props) {
  const styles = TEAM_COLOR_STYLES[color]

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <h3 className={`text-center font-semibold mb-3 ${styles.title}`}>{title}</h3>
      <div className="grid gap-2 mb-3">
        {team.players.map((player: PlayerInfo) => (
          <div key={player.id} className="bg-gray-50 rounded px-3 py-2 text-center">
            <strong>{player.name}</strong>
            {goalkeeperIds.has(player.id) && (
              <span className="ml-2" title="Arquero">
                🧤
              </span>
            )}
            {!manualIds.has(player.id) && <span className="ml-2 text-xs font-medium text-brand">auto</span>}
          </div>
        ))}
      </div>
      <div className="bg-gray-100 rounded px-3 py-2 text-center font-semibold">
        <span className="mr-2">Total habilidad:</span>
        {team.totalSkill}
        <span className="mx-2">|</span>
        <span className="mr-2">Total físico:</span>
        {team.totalPhysical}
        <span className="mx-2">|</span>
        <span className="mr-2">Probabilidad de victoria:</span>
        {winProbability}%
      </div>
    </div>
  )
}
