'use client'

import type { SkillMode } from '@fulbito/types'
import type { SortDirection } from '@tanstack/react-table'
import { colorForSkill } from '@/components/SkillBadge'
import Arrow from '@/app/shared/Icons/Arrow'

type Props = {
  mode: SkillMode
  sortDirection: false | SortDirection
  onSelect: (mode: SkillMode) => void
}

const OPTIONS: { mode: SkillMode; label: string }[] = [
  { mode: 'player', label: '⚽️' },
  { mode: 'goalkeeper', label: '🧤' },
]

const tweaks = { saturationScale: 0.9 }

const GRADIENT_COLORS: Record<SkillMode, { high: string; low: string }> = {
  player: {
    high: colorForSkill(8, { ...tweaks, lightnessOffset: 12 }),
    low: colorForSkill(5, { ...tweaks, lightnessOffset: 8 }),
  },
  goalkeeper: {
    high: 'var(--color-goalkeeper-high)',
    low: 'var(--color-goalkeeper-low)',
  },
}

function getGradient(mode: SkillMode, isAscending: boolean) {
  const { high, low } = GRADIENT_COLORS[mode]
  const [from, to] = isAscending ? [low, high] : [high, low]
  return `linear-gradient(165deg in oklch, ${from} 45%, ${to} 65%)`
}

export default function SkillSortHeader({ mode, sortDirection, onSelect }: Props) {
  return (
    <span className="inline-flex items-center gap-2">
      Habilidad
      <span role="group" aria-label="Ordenar habilidad por" className="inline-flex gap-2">
        {OPTIONS.map((option) => {
          const isActive = mode === option.mode && sortDirection !== false
          return (
            <button
              key={option.mode}
              type="button"
              aria-pressed={isActive}
              onClick={(event) => {
                event.stopPropagation()
                onSelect(option.mode)
              }}
              className={`group relative inline-flex items-center gap-1 overflow-hidden rounded-full px-3 py-1 text-xs font-semibold text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-95 ${
                isActive ? 'shadow-md' : ''
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-0 transition-opacity duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-25 group-hover:opacity-55'
                }`}
                style={{ backgroundImage: getGradient(option.mode, isActive && sortDirection === 'asc') }}
              />
              <span className="relative inline-flex items-center gap-1">
                {option.label}
                {isActive && <Arrow direction={sortDirection === 'asc' ? 'up' : 'down'} />}
              </span>
            </button>
          )
        })}
      </span>
    </span>
  )
}
