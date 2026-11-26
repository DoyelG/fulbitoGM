'use client'

import { useId, useMemo, useRef, type CSSProperties } from 'react'
import type { MatchPlayer, PitchPosition } from '@fulbito/types'
import {
  computePlayerStatRows,
  defaultTeamFormation,
  getPositionLabel,
  resolvePitchDrop,
  resolveTeamPositions,
} from '@fulbito/utils'
import { usePitchDrag } from '@/hooks/use-pitch-drag'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import PitchLines from './PitchLines'
import PitchPlayer, { type PitchDensity } from './PitchPlayer'

export type MatchPitchProps = {
  teamA: MatchPlayer[]
  teamB: MatchPlayer[]
  mvpId?: string | null
  goalkeeperIds?: readonly string[]
  editable?: boolean
  onPlayerMove?: (playerId: string, position: PitchPosition) => void
  showMatchStats?: boolean
  wide?: boolean
  className?: string
}

const EMPTY: readonly string[] = []
const TALL_FROM = 7

function densityFor(largestTeam: number): PitchDensity {
  if (largestTeam <= 6)
    return { avatar: 'md', nameClass: 'text-xs max-w-[28cqw] sm:max-w-[14cqw]', compactBalls: false }
  if (largestTeam <= 8) {
    return { avatar: 'base', nameClass: 'text-xs max-w-[22cqw] sm:max-w-[10.5cqw]', compactBalls: false }
  }
  return {
    avatar: 'sm',
    nameClass: 'text-[11px] max-w-[19cqw] sm:max-w-[9.5cqw]',
    maxChars: 10,
    compactBalls: true,
  }
}

export default function MatchPitch({
  teamA,
  teamB,
  mvpId = null,
  goalkeeperIds = EMPTY,
  editable = false,
  onPlayerMove,
  showMatchStats = true,
  wide = false,
  className = '',
}: MatchPitchProps) {
  const containerRef = useRef<HTMLUListElement>(null)
  const uid = useId()
  const players = usePlayerStore((state) => state.players)
  const matches = useMatchStore((state) => state.matches)
  const playerById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players])
  const statsById = useMemo(
    () => new Map(computePlayerStatRows(players, matches).map((row) => [row.id, row])),
    [players, matches],
  )

  const roleById = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.position])), [players])
  const largestTeam = Math.max(teamA.length, teamB.length)
  const density = densityFor(largestTeam)
  const tall = largestTeam >= TALL_FROM
  const isEditable = editable && onPlayerMove !== undefined
  const instructionsId = `${uid}-drag`

  const sides = [
    {
      side: 'A' as const,
      label: 'Equipo A',
      team: teamA,
      positions: resolveTeamPositions(teamA, goalkeeperIds, 'A', roleById),
      spots: Object.values(
        defaultTeamFormation(
          teamA.map((player) => player.id),
          goalkeeperIds,
          'A',
          roleById,
        ),
      ),
    },
    {
      side: 'B' as const,
      label: 'Equipo B',
      team: teamB,
      positions: resolveTeamPositions(teamB, goalkeeperIds, 'B', roleById),
      spots: Object.values(
        defaultTeamFormation(
          teamB.map((player) => player.id),
          goalkeeperIds,
          'B',
          roleById,
        ),
      ),
    },
  ]

  const sideOf = (playerId: string) => sides.find(({ positions }) => playerId in positions)

  const settleDrop = (playerId: string, origin: PitchPosition) => {
    const side = sideOf(playerId)
    const position = side?.positions[playerId]
    if (!side || !position) return
    const opponents = sides.filter((other) => other !== side).flatMap((other) => Object.values(other.positions))
    resolvePitchDrop({ id: playerId, position, origin }, side.spots, side.positions, opponents).forEach((move) =>
      onPlayerMove?.(move.id, move.position),
    )
  }

  const { draggingId, handlersFor } = usePitchDrag(
    containerRef,
    (id, position) => onPlayerMove?.(id, position),
    settleDrop,
  )
  const guideSpots = draggingId ? (sideOf(draggingId)?.spots ?? []) : []

  return (
    <div className={className}>
      {isEditable && (
        <p id={instructionsId} className="sr-only">
          Arrastrá la ficha o usá las flechas del teclado para moverla. Con Mayúscula se mueve más rápido.
        </p>
      )}
      <div
        className={`@container relative rounded-2xl border-2 border-white/22 bg-white/4 ${wide ? 'sm:aspect-[2/1] xl:aspect-[12/5]' : 'sm:aspect-[2/1]'} ${tall ? 'aspect-[9/16]' : 'aspect-[2/3]'}`}
      >
        <PitchLines tall={tall} wide={wide} />
        {guideSpots.length > 0 && (
          <div aria-hidden className="pointer-events-none absolute inset-x-4 inset-y-6 sm:inset-x-6 sm:inset-y-4">
            {guideSpots.map((spot) => (
              <span
                key={`${spot.x}-${spot.y}`}
                style={{ '--pitch-x': `${spot.x}%`, '--pitch-y': `${spot.y}%` } as CSSProperties}
                className="absolute top-(--pitch-x) left-(--pitch-y) h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-white/35 sm:top-(--pitch-y) sm:left-(--pitch-x)"
              />
            ))}
          </div>
        )}
        <ul
          ref={containerRef}
          aria-label="Jugadores en la cancha"
          className="absolute inset-x-4 inset-y-6 sm:inset-x-6 sm:inset-y-4"
        >
          {sides.flatMap(({ side, label, team, positions }) =>
            team.map((player) => {
              const profile = playerById.get(player.id)
              const stats = statsById.get(player.id)
              const spot = positions[player.id]
              const isMvp = player.id === mvpId
              return (
                <PitchPlayer
                  key={player.id}
                  playerId={player.id}
                  tooltipId={`${uid}-${player.id}`}
                  name={player.name}
                  photoUrl={profile?.photoUrl}
                  goals={showMatchStats ? player.goals : 0}
                  side={side}
                  isMvp={isMvp}
                  spot={spot}
                  density={density}
                  tooltip={{
                    name: profile?.name ?? player.name,
                    position: profile?.position ? getPositionLabel(profile.position) : undefined,
                    teamLabel: label,
                    isMvp,
                    tournament: stats ? { matches: stats.matches, goals: stats.goals, mvps: stats.mvps } : undefined,
                    match: showMatchStats ? { goals: player.goals, performance: player.performance } : undefined,
                  }}
                  drag={
                    isEditable
                      ? {
                          ...handlersFor(player.id, spot),
                          isDragging: draggingId === player.id,
                          describedBy: instructionsId,
                        }
                      : undefined
                  }
                />
              )
            }),
          )}
        </ul>
      </div>
    </div>
  )
}
