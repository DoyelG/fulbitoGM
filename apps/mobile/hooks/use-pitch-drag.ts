import type { PitchPosition } from '@fulbito/types'
import { clampPitchPosition } from '@fulbito/utils'
import { useEffect, useRef, useState } from 'react'
import type { GestureResponderEvent, GestureResponderHandlers } from 'react-native'

export type PitchArea = { width: number; height: number }

type Options = {
  enabled: boolean
  position: PitchPosition
  area: PitchArea
  onStart: () => void
  onMove: (position: PitchPosition) => void
  onRelease: (origin: PitchPosition, moved: boolean) => void
  onLongPress?: () => void
}

const DRAG_THRESHOLD = 6
export const LONG_PRESS_MS = 1000

type DragStart = { pageX: number; pageY: number; origin: PitchPosition; moved: boolean }

function verticalPitchPosition(start: DragStart, event: GestureResponderEvent, area: PitchArea): PitchPosition {
  const { pageX, pageY } = event.nativeEvent
  return clampPitchPosition({
    x: start.origin.x + ((pageY - start.pageY) / area.height) * 100,
    y: start.origin.y + ((pageX - start.pageX) / area.width) * 100,
  })
}

export function usePitchDrag({
  enabled,
  position,
  area,
  onStart,
  onMove,
  onRelease,
  onLongPress,
}: Options): GestureResponderHandlers {
  const [start, setStart] = useState<DragStart | null>(null)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    holdTimer.current = null
  }

  useEffect(() => cancelHold, [])

  if (!enabled) return {}

  const finish = () => {
    cancelHold()
    if (start) onRelease(start.origin, start.moved)
    setStart(null)
  }

  return {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (event) => {
      setStart({ pageX: event.nativeEvent.pageX, pageY: event.nativeEvent.pageY, origin: position, moved: false })
      onStart()
      cancelHold()
      if (onLongPress) holdTimer.current = setTimeout(onLongPress, LONG_PRESS_MS)
      return true
    },
    onResponderMove: (event) => {
      if (!start || area.width === 0 || area.height === 0) return
      if (!start.moved) {
        const { pageX, pageY } = event.nativeEvent
        if (Math.hypot(pageX - start.pageX, pageY - start.pageY) < DRAG_THRESHOLD) return
        cancelHold()
        setStart({ ...start, moved: true })
      }
      onMove(verticalPitchPosition(start, event, area))
    },
    onResponderRelease: finish,
    onResponderTerminate: finish,
  }
}
