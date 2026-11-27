import { useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import type { PitchPosition } from '@fulbito/types'
import { clampPitchPosition, type PitchSide } from '@fulbito/utils'

const STEP = 2
const BIG_STEP = 10
const DRAG_THRESHOLD = 6

type Delta = { dx: number; dy: number }

type Press = {
  playerId: string
  clientX: number
  clientY: number
  origin: PitchPosition
  last: PitchPosition
  moved: boolean
}

const HORIZONTAL_KEYS: Record<string, Delta> = {
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
}
const VERTICAL_KEYS: Record<string, Delta> = {
  ArrowUp: { dx: -1, dy: 0 },
  ArrowDown: { dx: 1, dy: 0 },
  ArrowLeft: { dx: 0, dy: -1 },
  ArrowRight: { dx: 0, dy: 1 },
}

export type PitchDragHandlers = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void
  onPointerMove: (event: PointerEvent<HTMLElement>) => void
  onPointerUp: (event: PointerEvent<HTMLElement>) => void
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
}

export function usePitchDrag(
  containerRef: RefObject<HTMLElement | null>,
  onMove: (playerId: string, position: PitchPosition) => void,
  onRelease?: (playerId: string, origin: PitchPosition, position: PitchPosition) => void,
) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const pressRef = useRef<Press | null>(null)

  const isHorizontal = () => {
    const rect = containerRef.current?.getBoundingClientRect()
    return !rect || rect.width >= rect.height
  }

  const pointerPosition = (clientX: number, clientY: number, side: PitchSide): PitchPosition | null => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return null
    const across = ((clientX - rect.left) / rect.width) * 100
    const down = ((clientY - rect.top) / rect.height) * 100
    return clampPitchPosition(isHorizontal() ? { x: across, y: down } : { x: down, y: across }, side)
  }

  const handlersFor = (playerId: string, current: PitchPosition, side: PitchSide): PitchDragHandlers => {
    const stop = (event: PointerEvent<HTMLElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      const press = pressRef.current
      if (press?.playerId === playerId && press.moved) onRelease?.(playerId, press.origin, press.last)
      pressRef.current = null
      setDraggingId(null)
    }
    return {
      onPointerDown: (event) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        pressRef.current = {
          playerId,
          clientX: event.clientX,
          clientY: event.clientY,
          origin: current,
          last: current,
          moved: false,
        }
      },
      onPointerMove: (event) => {
        const press = pressRef.current
        if (press?.playerId !== playerId) return
        if (!press.moved) {
          if (Math.hypot(event.clientX - press.clientX, event.clientY - press.clientY) < DRAG_THRESHOLD) return
          press.moved = true
          setDraggingId(playerId)
        }
        const next = pointerPosition(event.clientX, event.clientY, side)
        if (!next) return
        press.last = next
        onMove(playerId, next)
      },
      onPointerUp: stop,
      onPointerCancel: stop,
      onKeyDown: (event) => {
        const delta = (isHorizontal() ? HORIZONTAL_KEYS : VERTICAL_KEYS)[event.key]
        if (!delta) return
        event.preventDefault()
        const step = event.shiftKey ? BIG_STEP : STEP
        onMove(playerId, clampPitchPosition({ x: current.x + delta.dx * step, y: current.y + delta.dy * step }, side))
      },
    }
  }

  return { draggingId, handlersFor }
}
