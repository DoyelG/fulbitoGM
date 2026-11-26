import { useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import type { PitchPosition } from '@fulbito/types'
import { clampPitchPosition } from '@fulbito/utils'

const STEP = 2
const BIG_STEP = 10

type Delta = { dx: number; dy: number }

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
  onRelease?: (playerId: string, origin: PitchPosition) => void,
) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const originRef = useRef<PitchPosition | null>(null)

  const isHorizontal = () => {
    const rect = containerRef.current?.getBoundingClientRect()
    return !rect || rect.width >= rect.height
  }

  const pointerPosition = (clientX: number, clientY: number): PitchPosition | null => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return null
    const across = ((clientX - rect.left) / rect.width) * 100
    const down = ((clientY - rect.top) / rect.height) * 100
    return clampPitchPosition(isHorizontal() ? { x: across, y: down } : { x: down, y: across })
  }

  const handlersFor = (playerId: string, current: PitchPosition): PitchDragHandlers => {
    const stop = (event: PointerEvent<HTMLElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      if (draggingId === playerId && originRef.current) onRelease?.(playerId, originRef.current)
      originRef.current = null
      setDraggingId(null)
    }
    return {
      onPointerDown: (event) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        originRef.current = current
        setDraggingId(playerId)
      },
      onPointerMove: (event) => {
        if (draggingId !== playerId) return
        const next = pointerPosition(event.clientX, event.clientY)
        if (next) onMove(playerId, next)
      },
      onPointerUp: stop,
      onPointerCancel: stop,
      onKeyDown: (event) => {
        const delta = (isHorizontal() ? HORIZONTAL_KEYS : VERTICAL_KEYS)[event.key]
        if (!delta) return
        event.preventDefault()
        const step = event.shiftKey ? BIG_STEP : STEP
        onMove(playerId, clampPitchPosition({ x: current.x + delta.dx * step, y: current.y + delta.dy * step }))
      },
    }
  }

  return { draggingId, handlersFor }
}
