'use client'

import { useEffect, useRef, useState } from 'react'
import { MATCH_HOUR_OPTIONS, formatMatchClock } from '@fulbito/utils'
import SelectChevron from './SelectChevron'

type Props = {
  id: string
  value: number | null
  onChange: (hour: number | null) => void
  labelClassName?: string
}

const OPTIONS: (number | null)[] = [null, ...MATCH_HOUR_OPTIONS]

const LIST_MAX_HEIGHT = 220

function optionLabel(hour: number | null): string {
  return hour === null ? '-' : formatMatchClock(hour)
}

export default function HourField({ id, value, onChange, labelClassName = 'block text-sm font-medium' }: Props) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLLIElement>(null)
  const listId = `${id}-list`

  useEffect(() => {
    if (!open) return
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
    const onMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const toggle = () => {
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUp(spaceBelow < LIST_MAX_HEIGHT + 8 && rect.top > spaceBelow)
    }
    setOpen((o) => !o)
  }

  const select = (hour: number | null) => {
    onChange(hour)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative inline-flex flex-col gap-1 w-24">
      <label htmlFor={id} className={labelClassName}>
        Hora
      </label>
      <button
        id={id}
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="relative h-10 flex items-center pl-2.5 pr-8 border border-gray-500 rounded bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-brand"
      >
        <span>{optionLabel(value)}</span>
        <SelectChevron />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={id}
          className={`absolute left-0 z-20 w-full max-h-[220px] overflow-auto bg-white border border-gray-500 rounded shadow-md ${
            openUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {OPTIONS.map((h) => {
            const selected = value === h
            return (
              <li
                key={String(h)}
                ref={selected ? selectedRef : undefined}
                role="option"
                aria-selected={selected}
                tabIndex={0}
                onClick={() => select(h)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    select(h)
                  }
                }}
                className={`px-2.5 py-2 text-[15px] focus:outline-none ${
                  selected ? 'bg-brand text-white cursor-pointer' : 'cursor-pointer hover:bg-brand/10 focus:bg-brand/10'
                }`}
              >
                {optionLabel(h)}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
