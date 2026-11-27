import type { Player } from '@fulbito/types'
import { getPositionLabel, type PlayerStatRow } from '@fulbito/utils'
import type { PitchDragHandlers } from '@/hooks/use-pitch-drag'
import type { PitchSideData } from '@/hooks/use-pitch-sides'
import type { PitchTooltipState } from '@/hooks/use-pitch-tooltip'
import PitchPlayer, { type PitchDensity } from './PitchPlayer'

export type PitchTokenDrag = PitchDragHandlers & { isDragging: boolean; describedBy: string }

type Props = {
  data: PitchSideData
  uid: string
  mvpId: string | null
  showMatchStats: boolean
  density: PitchDensity
  playerById: ReadonlyMap<string, Player>
  statsById: ReadonlyMap<string, PlayerStatRow>
  tooltip: PitchTooltipState
  dragFor?: (playerId: string) => PitchTokenDrag
}

export default function PitchSideTokens({
  data,
  uid,
  mvpId,
  showMatchStats,
  density,
  playerById,
  statsById,
  tooltip,
  dragFor,
}: Props) {
  return data.team.map((player) => {
    const profile = playerById.get(player.id)
    const stats = statsById.get(player.id)
    const isMvp = player.id === mvpId
    return (
      <PitchPlayer
        key={player.id}
        playerId={player.id}
        tooltipId={`${uid}-${player.id}`}
        name={player.name}
        photoUrl={profile?.photoUrl}
        goals={showMatchStats ? player.goals : 0}
        side={data.side}
        isMvp={isMvp}
        spot={data.positions[player.id]}
        density={density}
        tooltipOpen={tooltip.openId === player.id}
        onHoverChange={(hovering) => tooltip.hover(player.id, hovering)}
        onFocusChange={(focused) => tooltip.focus(player.id, focused)}
        onTap={() => tooltip.tap(player.id)}
        tooltip={{
          name: profile?.name ?? player.name,
          position: profile?.position ? getPositionLabel(profile.position) : undefined,
          teamLabel: data.label,
          isMvp,
          tournament: stats ? { matches: stats.matches, goals: stats.goals, mvps: stats.mvps } : undefined,
          match: showMatchStats ? { goals: player.goals, performance: player.performance } : undefined,
        }}
        drag={dragFor?.(player.id)}
      />
    )
  })
}
