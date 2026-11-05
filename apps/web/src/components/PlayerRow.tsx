'use client'

import { useState, type CSSProperties, type PointerEvent } from 'react'
import type { Player } from '@/store/usePlayerStore'
import Button from '@/components/Button'

type Props = {
  player: Player
  isSelected: boolean
  isGoalkeeper: boolean
  isGoalkeeperDisabled: boolean
  onToggleSelect: () => void
  onToggleGoalkeeper?: () => void
  isMultiSelector: boolean
  groupName: string
}

type Origin = { x: number; y: number; radius: number }

export default function PlayerRow({
  player,
  isSelected,
  isGoalkeeper,
  isGoalkeeperDisabled,
  onToggleSelect,
  onToggleGoalkeeper,
  isMultiSelector,
  groupName,
}: Props) {
  const [origin, setOrigin] = useState<Origin | null>(null)

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y))
    setOrigin({ x, y, radius })
  }

  const circleStyle: CSSProperties = {
    left: origin ? origin.x : '50%',
    top: origin ? origin.y : '50%',
    width: origin ? origin.radius * 2 : '150%',
    transform: `translate(-50%, -50%) scale(${isSelected ? 1 : 0})`,
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`relative isolate flex items-center justify-between gap-2 overflow-hidden rounded-lg bg-gray-50 px-2.5 py-2 ring-1 ring-inset select-none transition-shadow duration-700 ${
        isSelected ? 'ring-brand/20' : 'ring-transparent'
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 aspect-square rounded-full bg-brand/9 motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-in-out"
        style={circleStyle}
      />
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
        <input
          type={isMultiSelector ? 'checkbox' : 'radio'}
          name={groupName}
          checked={isSelected}
          onChange={onToggleSelect}
          className="accent-brand"
        />
        <span className="truncate font-medium">{player.name}</span>
      </label>
      {isSelected && onToggleGoalkeeper && (
        <Button
          variant={isGoalkeeper ? 'primary' : 'soft'}
          size="xs"
          className="shrink-0"
          onClick={onToggleGoalkeeper}
          disabled={isGoalkeeperDisabled}
          aria-pressed={isGoalkeeper}
          title={isGoalkeeper ? 'Quitar como arquero' : 'Marcar como arquero'}
        >
          🧤 Arquero
        </Button>
      )}
    </div>
  )
}
