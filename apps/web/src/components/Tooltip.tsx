'use client'

import { type ReactNode, useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  label: string
  children: ReactNode
  position?: 'top' | 'bottom'
  delay?: number
  variant?: "primary" | "danger"
}

const GAP = 8

export default function Tooltip({ label, children, position = 'top', delay = 300, variant = 'primary' }: Props) {
  const [active, setActive] = useState(false)
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActive(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActive(false)
  }, [])

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  useLayoutEffect(() => {
    if (!active || !triggerRef.current) {
      setCoords(null)
      return
    }
    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({
      x: rect.left + rect.width / 2,
      y: position === 'top' ? rect.top - GAP : rect.bottom + GAP,
    })
  }, [active, position])

  const isTop = position === 'top'

  const tooltip = (
    <span
      role="tooltip"
      style={coords ? { left: coords.x, top: coords.y } : undefined}
      className={[
        'fixed z-[9999] pointer-events-none',
        'px-2.5 py-1 text-[11px] font-semibold tracking-wide',
        variant === 'primary' ? 'text-brand-contrast bg-brand rounded-md' : 'text-red-600 bg-red-50 rounded-md',
        'shadow-[0_4px_12px_rgba(124,58,237,0.35)]',
        'whitespace-nowrap select-none',
        'transition-all duration-200 ease-out',
        isTop
          ? '-translate-x-1/2 -translate-y-full origin-bottom'
          : '-translate-x-1/2 origin-top',
        active && coords
          ? 'scale-100 opacity-100'
          : `scale-90 opacity-0`,
      ].join(' ')}
    >
      {label}
      <span
        className={[
          'absolute left-1/2 -translate-x-1/2 size-2 rotate-45',
          variant === 'primary' ? 'bg-brand' : 'bg-red-50',
          isTop ? '-bottom-1' : '-top-1',
        ].join(' ')}
      />
    </span>
  )

  return (
    <span ref={triggerRef} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </span>
  )
}
