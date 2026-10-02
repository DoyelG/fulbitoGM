'use client'

import { useRef, type KeyboardEvent } from 'react'

export type LeaderboardTab<K extends string> = { key: K; label: string }

export type LeaderboardTabsProps<K extends string> = {
  idPrefix: string
  tabs: LeaderboardTab<K>[]
  active: K
  onChange: (key: K) => void
}

export default function LeaderboardTabs<K extends string>({ idPrefix, tabs, active, onChange }: LeaderboardTabsProps<K>) {
  const refs = useRef<Partial<Record<K, HTMLButtonElement | null>>>({})

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const index = tabs.findIndex((t) => t.key === active)
    const step = e.key === 'ArrowRight' ? 1 : -1
    const next = tabs[(index + step + tabs.length) % tabs.length]
    onChange(next.key)
    refs.current[next.key]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Ranking de la temporada"
      onKeyDown={onKeyDown}
      className="inline-flex rounded-lg bg-gray-100 p-1"
    >
      {tabs.map((t) => {
        const selected = t.key === active
        return (
          <button
            key={t.key}
            ref={(el) => {
              refs.current[t.key] = el
            }}
            id={`${idPrefix}-tab-${t.key}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.key)}
            className={`min-h-11 rounded-md px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              selected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
