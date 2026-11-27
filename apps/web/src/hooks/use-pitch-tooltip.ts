import { useEffect, useState } from 'react'

export type PitchTooltipState = {
  openId: string | null
  hover: (playerId: string, hovering: boolean) => void
  focus: (playerId: string, focused: boolean) => void
  tap: (playerId: string) => void
}

function toggleFor(playerId: string, active: boolean) {
  return (current: string | null) => (active ? playerId : current === playerId ? null : current)
}

export function usePitchTooltip(): PitchTooltipState {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [tappedId, setTappedId] = useState<string | null>(null)

  useEffect(() => {
    if (!tappedId) return
    const closeOnOutsideTap = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest('[data-pitch-player]') : null
      if (target?.getAttribute('data-pitch-player') !== tappedId) setTappedId(null)
    }
    document.addEventListener('pointerdown', closeOnOutsideTap)
    return () => document.removeEventListener('pointerdown', closeOnOutsideTap)
  }, [tappedId])

  return {
    openId: hoveredId ?? tappedId ?? focusedId,
    hover: (playerId, hovering) => setHoveredId(toggleFor(playerId, hovering)),
    focus: (playerId, focused) => setFocusedId(toggleFor(playerId, focused)),
    tap: setTappedId,
  }
}
