import type { PitchPosition } from '@fulbito/types'
import { clampPitchPosition, type PitchSide } from '@fulbito/utils'
import { Pressable, Text, View, type AccessibilityActionEvent } from 'react-native'

import { UserAvatar } from '@/components/user-avatar'
import { LONG_PRESS_MS, usePitchDrag, type PitchArea } from '@/hooks/use-pitch-drag'

import { styles } from './pitch-player.styles'

export type PitchDensity = {
  avatar: number
  width: number
  fontSize: number
  compactBalls: boolean
}

type Props = {
  name: string
  photoUrl?: string | null
  goals: number
  side: PitchSide
  isMvp: boolean
  spot: PitchPosition
  area: PitchArea
  density: PitchDensity
  editable: boolean
  isDragging: boolean
  description: string
  onPress?: () => void
  onLongPress: () => void
  onDragStart: () => void
  onMove: (position: PitchPosition) => void
  onRelease: (origin: PitchPosition, moved: boolean, position: PitchPosition) => void
}

const MAX_BALLS = 5
const A11Y_STEP = 5

const A11Y_MOVES: Record<string, PitchPosition> = {
  moveUp: { x: -A11Y_STEP, y: 0 },
  moveDown: { x: A11Y_STEP, y: 0 },
  moveLeft: { x: 0, y: -A11Y_STEP },
  moveRight: { x: 0, y: A11Y_STEP },
}

const A11Y_ACTIONS = [
  { name: 'moveUp', label: 'Mover hacia arriba' },
  { name: 'moveDown', label: 'Mover hacia abajo' },
  { name: 'moveLeft', label: 'Mover a la izquierda' },
  { name: 'moveRight', label: 'Mover a la derecha' },
]

function goalBalls(goals: number, compact: boolean): string {
  if (goals <= 0) return ''
  return goals > MAX_BALLS || (compact && goals > 1) ? `⚽×${goals}` : '⚽'.repeat(goals)
}

export function PitchPlayer({
  name,
  photoUrl,
  goals,
  side,
  isMvp,
  spot,
  area,
  density,
  editable,
  isDragging,
  description,
  onPress,
  onLongPress,
  onDragStart,
  onMove,
  onRelease,
}: Props) {
  const panHandlers = usePitchDrag({
    enabled: editable,
    side,
    position: spot,
    area,
    onStart: onDragStart,
    onMove,
    onRelease,
    onLongPress,
  })
  const ringSize = density.avatar + 6
  const left = (spot.y / 100) * area.width - density.width / 2
  const top = (spot.x / 100) * area.height - ringSize / 2
  const balls = goalBalls(goals, density.compactBalls)

  const handleAccessibilityAction = ({ nativeEvent }: AccessibilityActionEvent) => {
    const delta = A11Y_MOVES[nativeEvent.actionName]
    if (!delta) return
    onMove(clampPitchPosition({ x: spot.x + delta.x, y: spot.y + delta.y }, side))
  }

  const tokenStyle = [
    styles.token,
    { left, top, width: density.width },
    isDragging && styles.tokenRaised,
    isDragging && styles.tokenDragging,
  ]

  const body = (
    <>
      <View style={[styles.avatarWrap, side === 'A' && styles.avatarTeamA, isMvp && styles.avatarMvp]}>
        <UserAvatar imageUrl={photoUrl} size={density.avatar} />
        {isMvp && (
          <Text style={styles.mvpStar} accessible={false}>
            ⭐
          </Text>
        )}
        {balls !== '' && (
          <Text style={styles.balls} numberOfLines={1} accessible={false}>
            {balls}
          </Text>
        )}
      </View>
      <Text numberOfLines={2} style={[styles.name, { fontSize: density.fontSize }]}>
        {name}
      </Text>
    </>
  )

  if (editable) {
    return (
      <View
        {...panHandlers}
        style={tokenStyle}
        accessible
        accessibilityLabel={`${description}. Ficha movible`}
        accessibilityHint="Arrastrá la ficha o usá las acciones de accesibilidad para moverla"
        accessibilityActions={A11Y_ACTIONS}
        onAccessibilityAction={handleAccessibilityAction}
      >
        {body}
      </View>
    )
  }

  return (
    <Pressable
      style={tokenStyle}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={LONG_PRESS_MS}
      accessibilityRole="link"
      accessibilityLabel={description}
      accessibilityHint="Abre la ficha del jugador"
    >
      {body}
    </Pressable>
  )
}
