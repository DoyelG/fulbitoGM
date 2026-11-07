'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useHideOnScroll } from '@/hooks/use-hide-on-scroll'

const SHADOW_CLEARANCE = 16

export default function SiteHeader({ children }: { children: ReactNode }) {
  const headerRef = useRef<HTMLElement>(null)
  const [height, setHeight] = useState(0)
  const { hidden, reveal } = useHideOnScroll(height)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const observer = new ResizeObserver(() => setHeight(header.offsetHeight))
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--site-header-offset', hidden ? '0px' : `${height}px`)
  }, [hidden, height])

  return (
    <header
      ref={headerRef}
      onFocusCapture={reveal}
      style={{ top: hidden ? -(height + SHADOW_CLEARANCE) : 0 }}
      className="sticky z-30 transition-[top] duration-300 ease-out motion-reduce:transition-none"
    >
      <div className="bg-primary-gradient border-b border-white/10 text-white shadow-md shadow-primary/30">
        {children}
      </div>
    </header>
  )
}
