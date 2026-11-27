import { useMemo } from 'react'
import type { MatchPlayer, PitchPosition } from '@fulbito/types'
import { defaultTeamFormation, resolvePitchDrop, resolveTeamPositions, type PitchSide } from '@fulbito/utils'
import { usePlayerStore } from '@/store/usePlayerStore'

export type PitchSideData = {
  side: PitchSide
  label: string
  team: MatchPlayer[]
  positions: Record<string, PitchPosition>
  spots: PitchPosition[]
}

function sideData(
  side: PitchSide,
  team: MatchPlayer[],
  goalkeeperIds: readonly string[],
  roleById: Readonly<Record<string, string | undefined>>,
): PitchSideData {
  return {
    side,
    label: side === 'A' ? 'Equipo A' : 'Equipo B',
    team,
    positions: resolveTeamPositions(team, goalkeeperIds, side, roleById),
    spots: Object.values(
      defaultTeamFormation(
        team.map((player) => player.id),
        goalkeeperIds,
        side,
        roleById,
      ),
    ),
  }
}

export function usePitchSides(
  teamA: MatchPlayer[],
  teamB: MatchPlayer[],
  goalkeeperIds: readonly string[],
  onPlayerMove?: (playerId: string, position: PitchPosition) => void,
) {
  const players = usePlayerStore((state) => state.players)
  const roleById = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.position])), [players])
  const sides = [sideData('A', teamA, goalkeeperIds, roleById), sideData('B', teamB, goalkeeperIds, roleById)]

  const sideOf = (playerId: string) => sides.find(({ positions }) => playerId in positions)

  const settleDrop = (playerId: string, origin: PitchPosition, position: PitchPosition) => {
    const side = sideOf(playerId)
    if (!side) return
    const opponents = sides.filter((other) => other !== side).flatMap((other) => Object.values(other.positions))
    resolvePitchDrop({ id: playerId, position, origin }, side.spots, side.positions, opponents).forEach((move) =>
      onPlayerMove?.(move.id, move.position),
    )
  }

  return { sides, sideOf, settleDrop }
}
