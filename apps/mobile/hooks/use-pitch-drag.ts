import type { PitchPosition } from '@fulbito/types'
import { clampPitchPosition, type PitchSide } from '@fulbito/utils'
import { useEffect, useRef } from 'react'
import type { GestureResponderEvent, GestureResponderHandlers } from 'react-native'

export type PitchArea = { width: number; height: number }

type Options = {
  enabled: boolean
  side: PitchSide
  position: PitchPosition
  area: PitchArea
  onStart: () => void
  onMove: (position: PitchPosition) => void
  onRelease: (origin: PitchPosition, moved: boolean, position: PitchPosition) => void
  onLongPress?: () => void
}

const DRAG_THRESHOLD = 6
export const LONG_PRESS_MS = 1000

type DragStart = { pageX: number; pageY: number; origin: PitchPosition; moved: boolean; last: PitchPosition }

function verticalPitchPosition(
  start: DragStart,
  event: GestureResponderEvent,
  area: PitchArea,
  side: PitchSide,
): PitchPosition {
  const { pageX, pageY } = event.nativeEvent
  return clampPitchPosition(
    {
      x: start.origin.x + ((pageY - start.pageY) / area.height) * 100,
      y: start.origin.y + ((pageX - start.pageX) / area.width) * 100,
    },
    side,
  )
}

export function usePitchDrag({
  enabled,
  side,
  position,
  area,
  onStart,
  onMove,
  onRelease,
  onLongPress,
}: Options): GestureResponderHandlers {
  const startRef = useRef<DragStart | null>(null)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    holdTimer.current = null
  }

  useEffect(() => cancelHold, [])

  if (!enabled) return {}

  const finish = () => {
    cancelHold()
    const start = startRef.current
    startRef.current = null
    if (start) onRelease(start.origin, start.moved, start.last)
  }

  return {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (event) => {
      const { pageX, pageY } = event.nativeEvent
      startRef.current = { pageX, pageY, origin: position, moved: false, last: position }
      onStart()
      cancelHold()
      if (onLongPress) holdTimer.current = setTimeout(onLongPress, LONG_PRESS_MS)
      return true
    },
    onResponderMove: (event) => {
      const start = startRef.current
      if (!start || area.width === 0 || area.height === 0) return
      if (!start.moved) {
        const { pageX, pageY } = event.nativeEvent
        if (Math.hypot(pageX - start.pageX, pageY - start.pageY) < DRAG_THRESHOLD) return
        cancelHold()
        start.moved = true
      }
      start.last = verticalPitchPosition(start, event, area, side)
      onMove(start.last)
    },
    onResponderRelease: finish,
    onResponderTerminate: finish,
  }
}
