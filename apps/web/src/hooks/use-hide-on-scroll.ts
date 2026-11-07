'use client'

import { useCallback, useEffect, useState } from 'react'

const IGNORED_JITTER_PX = 8

export function useHideOnScroll(revealZone: number): { hidden: boolean; reveal: () => void } {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y <= revealZone) {
        setHidden(false)
        lastY = y
        return
      }
      if (Math.abs(y - lastY) < IGNORED_JITTER_PX) return
      setHidden(y > lastY)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [revealZone])

  const reveal = useCallback(() => setHidden(false), [])

  return { hidden, reveal }
}
