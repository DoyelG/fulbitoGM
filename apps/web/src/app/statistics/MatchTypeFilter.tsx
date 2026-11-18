'use client'

import { useEffect, useRef, useState } from 'react'
import { MATCH_TYPES, type MatchType } from '@fulbito/types'
import Chevron from '../shared/Icons/Chevron'

type Props = {
  value: MatchType[]
  onChange: (types: MatchType[]) => void
}

const summaryOf = (value: MatchType[]) => {
  if (value.length === 0) return 'Todos los modos'
  if (value.length <= 2) return value.join(', ')
  return `${value.length} modos`
}

const itemStyles = 'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50'

export default function MatchTypeFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const toggleType = (matchType: MatchType) => {
    const next = value.includes(matchType)
      ? value.filter((selectedType) => selectedType !== matchType)
      : [...value, matchType]
    onChange(next.length === MATCH_TYPES.length ? [] : next)
  }

  const isFiltered = value.length > 0

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <span id="match-type-filter-label" className="text-sm font-medium text-gray-700">
        Modo de partido
      </span>
      <button
        ref={buttonRef}
        id="match-type-filter-button"
        type="button"
        aria-expanded={open}
        aria-controls="match-type-filter-panel"
        aria-labelledby="match-type-filter-label match-type-filter-button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`relative h-9 w-full min-w-44 rounded-md border pl-3 pr-9 text-left text-sm font-medium shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          isFiltered ? 'border-primary bg-primary/5 text-primary' : 'border-gray-300 bg-white text-gray-700'
        }`}
      >
        {summaryOf(value)}
        <Chevron select />
      </button>

      {open && (
        <fieldset
          id="match-type-filter-panel"
          className="absolute left-0 top-full z-20 mt-1 w-full min-w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg"
        >
          <legend className="sr-only">Modo de partido</legend>
          <label className={itemStyles}>
            <input
              type="checkbox"
              checked={!isFiltered}
              onChange={() => onChange([])}
              className="size-4 accent-primary"
            />
            <span className="font-medium">Todos</span>
          </label>
          <hr className="my-1 border-gray-100" />
          {MATCH_TYPES.map((matchType) => (
            <label key={matchType} className={itemStyles}>
              <input
                type="checkbox"
                checked={value.includes(matchType)}
                onChange={() => toggleType(matchType)}
                className="size-4 accent-primary"
              />
              {matchType}
            </label>
          ))}
        </fieldset>
      )}
    </div>
  )
}
