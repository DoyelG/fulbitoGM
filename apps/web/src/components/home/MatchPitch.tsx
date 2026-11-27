'use client'

import { useId, useMemo, useRef } from 'react'
import type { MatchPlayer, PitchPosition } from '@fulbito/types'
import { computePlayerStatRows, type PitchSide } from '@fulbito/utils'
import { usePitchDrag } from '@/hooks/use-pitch-drag'
import { usePitchSides } from '@/hooks/use-pitch-sides'
import { usePitchTooltip } from '@/hooks/use-pitch-tooltip'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import PitchGuideSpots from './PitchGuideSpots'
import PitchLines from './PitchLines'
import type { PitchDensity } from './PitchPlayer'
import PitchSideTokens from './PitchSideTokens'

export type MatchPitchProps = {
  teamA: MatchPlayer[]
  teamB: MatchPlayer[]
  mvpId?: string | null
  goalkeeperIds?: readonly string[]
  editable?: boolean
  onPlayerMove?: (playerId: string, position: PitchPosition) => void
  showMatchStats?: boolean
  showTooltips?: boolean
  wide?: boolean
  className?: string
}

const EMPTY: readonly string[] = []
const TALL_FROM = 7
const PLAYER_LAYER = 'absolute inset-x-4 inset-y-6'

function densityFor(largestTeam: number): PitchDensity {
  if (largestTeam <= 6)
    return { avatar: 'md', nameClass: 'text-xs max-w-[28cqw] sm:max-w-[14cqw]', compactBalls: false }
  if (largestTeam <= 8) {
    return { avatar: 'base', nameClass: 'text-xs max-w-[22cqw] sm:max-w-[10.5cqw]', compactBalls: false }
  }
  return {
    avatar: 'sm',
    nameClass: 'text-[11px] max-w-[19cqw] sm:max-w-[9.5cqw]',
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
  showTooltips = true,
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
  const tooltipState = usePitchTooltip()
  const tooltip = showTooltips ? tooltipState : { ...tooltipState, openId: null }
  const { sides, sideOf, settleDrop } = usePitchSides(teamA, teamB, goalkeeperIds, onPlayerMove)
  const { draggingId, handlersFor } = usePitchDrag(
    containerRef,
    (id, position) => onPlayerMove?.(id, position),
    settleDrop,
  )

  const largestTeam = Math.max(teamA.length, teamB.length)
  const density = densityFor(largestTeam)
  const tall = largestTeam >= TALL_FROM
  const isEditable = editable && onPlayerMove !== undefined
  const instructionsId = `${uid}-drag`
  const spreadLayer = wide ? 'sm:-inset-x-[3.5%] sm:inset-y-4' : 'sm:-inset-x-[3.5%] sm:-inset-y-[3%]'
  const playerLayer = `${PLAYER_LAYER} ${tall ? spreadLayer : 'sm:inset-x-6 sm:inset-y-4'}`
  const guideSpots = draggingId ? (sideOf(draggingId)?.spots ?? []) : []

  const dragFor = (playerId: string, spot: PitchPosition, side: PitchSide) => ({
    ...handlersFor(playerId, spot, side),
    isDragging: draggingId === playerId,
    describedBy: instructionsId,
  })

  return (
    <div className={className}>
      {isEditable && (
        <p id={instructionsId} className="sr-only">
          Arrastrá la ficha o usá las flechas del teclado para moverla. Con Mayúscula se mueve más rápido.
        </p>
      )}
      <div
        className={`@container relative rounded-2xl border-2 border-white/22 bg-white/4 ${wide ? 'sm:aspect-[2/1] xl:aspect-[12/5]' : tall ? 'sm:aspect-video' : 'sm:aspect-[2/1]'} ${tall ? 'aspect-[9/16]' : 'aspect-[2/3]'}`}
      >
        <PitchLines tall={tall} wide={wide} />
        <PitchGuideSpots spots={guideSpots} className={playerLayer} />
        <ul ref={containerRef} aria-label="Jugadores en la cancha" className={playerLayer}>
          {sides.map((data) => (
            <PitchSideTokens
              key={data.side}
              data={data}
              uid={uid}
              mvpId={mvpId}
              showMatchStats={showMatchStats}
              density={density}
              playerById={playerById}
              statsById={statsById}
              tooltip={tooltip}
              dragFor={isEditable ? (playerId) => dragFor(playerId, data.positions[playerId], data.side) : undefined}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
