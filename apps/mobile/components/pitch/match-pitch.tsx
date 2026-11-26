import type { Match, MatchPlayer, PitchPosition, Player } from '@fulbito/types'
import {
  computePlayerStatRows,
  defaultTeamFormation,
  getPositionLabel,
  resolvePitchDrop,
  resolveTeamPositions,
  type PitchSide,
} from '@fulbito/utils'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { View, type LayoutChangeEvent } from 'react-native'

import type { PitchArea } from '@/hooks/use-pitch-drag'

import { GUIDE_SIZE, styles } from './match-pitch.styles'
import { PitchLines } from './pitch-lines'
import { CARD_EDGE, CARD_MAX_WIDTH } from './pitch-player-card.styles'
import { PitchPlayerCard, type PitchPlayerCardData } from './pitch-player-card'
import { PitchPlayer, type PitchDensity } from './pitch-player'
import { describePitchPlayer } from './pitch-player-description'

export type MatchPitchProps = {
  teamA: Pick<MatchPlayer, 'id' | 'name' | 'goals' | 'performance' | 'x' | 'y'>[]
  teamB: Pick<MatchPlayer, 'id' | 'name' | 'goals' | 'performance' | 'x' | 'y'>[]
  players: Player[]
  matches?: Match[]
  mvpId?: string | null
  goalkeeperIds?: readonly string[]
  showMatchStats?: boolean
  onPlayerMove?: (playerId: string, side: PitchSide, position: PitchPosition) => void
  onDraggingChange?: (dragging: boolean) => void
}

const EMPTY: readonly string[] = []
const NO_AREA: PitchArea = { width: 0, height: 0 }
const NO_MATCHES: Match[] = []
const NAME_BLOCK = 36
const CARD_GAP = 6

function fieldAspectRatio(largestTeam: number): number {
  if (largestTeam <= 6) return 2 / 3
  if (largestTeam <= 8) return 1 / 2
  return 4 / 9
}

function densityFor(largestTeam: number): PitchDensity {
  if (largestTeam <= 6) return { avatar: 40, width: 96, fontSize: 12, compactBalls: false }
  if (largestTeam <= 8) return { avatar: 34, width: 88, fontSize: 12, compactBalls: false }
  return { avatar: 28, width: 76, fontSize: 11, compactBalls: true }
}

export function MatchPitch({
  teamA,
  teamB,
  players,
  matches = NO_MATCHES,
  mvpId = null,
  goalkeeperIds = EMPTY,
  showMatchStats = true,
  onPlayerMove,
  onDraggingChange,
}: MatchPitchProps) {
  const [area, setArea] = useState<PitchArea>(NO_AREA)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [infoId, setInfoId] = useState<string | null>(null)
  const router = useRouter()
  const editable = onPlayerMove !== undefined

  const playerById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players])
  const statsById = useMemo(
    () => new Map(computePlayerStatRows(players, matches).map((row) => [row.id, row])),
    [players, matches],
  )
  const roleById = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.position])), [players])

  const largestTeam = Math.max(teamA.length, teamB.length)
  const density = densityFor(largestTeam)
  const aspectRatio = fieldAspectRatio(largestTeam)

  const sides = (
    [
      ['A', 'Equipo A', teamA],
      ['B', 'Equipo B', teamB],
    ] as const
  ).map(([side, label, team]) => ({
    side,
    label,
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
  }))

  const sideOf = (playerId: string) => sides.find(({ positions }) => playerId in positions)

  const settleDrop = (playerId: string, origin: PitchPosition, moved: boolean) => {
    setDraggingId(null)
    onDraggingChange?.(false)
    if (!moved) return
    const side = sideOf(playerId)
    const position = side?.positions[playerId]
    if (!side || !position) return
    const opponents = sides.filter((other) => other !== side).flatMap((other) => Object.values(other.positions))
    resolvePitchDrop({ id: playerId, position, origin }, side.spots, side.positions, opponents).forEach((move) =>
      onPlayerMove?.(move.id, side.side, move.position),
    )
  }

  const guideSpots = draggingId ? (sideOf(draggingId)?.spots ?? []) : []

  const cardDataFor = (player: MatchPitchProps['teamA'][number], label: string): PitchPlayerCardData => {
    const profile = playerById.get(player.id)
    const stats = statsById.get(player.id)
    return {
      name: profile?.name ?? player.name,
      position: profile?.position ? getPositionLabel(profile.position) : undefined,
      teamLabel: label,
      isMvp: player.id === mvpId,
      tournament: stats ? { matches: stats.matches, goals: stats.goals, mvps: stats.mvps } : undefined,
      match: showMatchStats ? { goals: player.goals, performance: player.performance } : undefined,
    }
  }

  const openProfile = (playerId: string) => {
    setInfoId(null)
    router.push({ pathname: '/(tabs)/players/[id]', params: { id: playerId } })
  }

  const showInfo = (playerId: string) => {
    setInfoId(playerId)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined)
  }

  const infoSide = infoId ? sideOf(infoId) : undefined
  const infoPlayer = infoSide?.team.find((player) => player.id === infoId)
  const infoSpot = infoId ? infoSide?.positions[infoId] : undefined

  const cardPlacement = (spot: PitchPosition) => {
    const width = Math.min(CARD_MAX_WIDTH, area.width - CARD_EDGE * 2)
    const centerX = (spot.y / 100) * area.width
    const centerY = (spot.x / 100) * area.height
    const left = Math.min(Math.max(centerX - width / 2, CARD_EDGE), area.width - width - CARD_EDGE)
    if (spot.x < 50) return { width, left, top: centerY + density.avatar / 2 + NAME_BLOCK + CARD_GAP }
    return { width, left, bottom: area.height - centerY + density.avatar / 2 + CARD_GAP }
  }

  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout
    setArea((previous) => (previous.width === width && previous.height === height ? previous : { width, height }))
  }

  return (
    <View style={[styles.field, { aspectRatio }]}>
      <PitchLines aspectRatio={aspectRatio} />
      <View
        style={styles.players}
        onLayout={handleLayout}
        accessibilityLabel="Jugadores en la cancha"
        accessibilityRole="list"
      >
        {guideSpots.map((spot) => (
          <View
            key={`${spot.x}-${spot.y}`}
            pointerEvents="none"
            accessible={false}
            style={[
              styles.guide,
              {
                left: (spot.y / 100) * area.width - GUIDE_SIZE / 2,
                top: (spot.x / 100) * area.height - GUIDE_SIZE / 2,
              },
            ]}
          />
        ))}
        {area.width > 0 &&
          sides.flatMap(({ side, label, team, positions }) =>
            team.map((player) => {
              const profile = playerById.get(player.id)
              const isMvp = player.id === mvpId
              return (
                <PitchPlayer
                  key={player.id}
                  name={player.name}
                  photoUrl={profile?.photoUrl}
                  goals={showMatchStats ? player.goals : 0}
                  side={side}
                  isMvp={isMvp}
                  spot={positions[player.id]}
                  area={area}
                  density={density}
                  editable={editable}
                  isDragging={draggingId === player.id}
                  description={describePitchPlayer({
                    name: profile?.name ?? player.name,
                    position: profile?.position ? getPositionLabel(profile.position) : undefined,
                    teamLabel: label,
                    isMvp,
                    goals: showMatchStats ? player.goals : 0,
                  })}
                  onPress={() => openProfile(player.id)}
                  onLongPress={() => showInfo(player.id)}
                  onDragStart={() => {
                    setDraggingId(player.id)
                    onDraggingChange?.(true)
                  }}
                  onMove={(position) => {
                    setInfoId(null)
                    onPlayerMove?.(player.id, side, position)
                  }}
                  onRelease={(origin, moved) => settleDrop(player.id, origin, moved)}
                />
              )
            }),
          )}
        {infoSide && infoPlayer && infoSpot && (
          <PitchPlayerCard
            data={cardDataFor(infoPlayer, infoSide.label)}
            placement={cardPlacement(infoSpot)}
            onOpenProfile={() => openProfile(infoPlayer.id)}
            onClose={() => setInfoId(null)}
          />
        )}
      </View>
    </View>
  )
}
