'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const ARROW_CLASS =
  'absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-md hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:grid'

export default function VideoCarousel({ children, itemCount }: { children: ReactNode; itemCount: number }) {
  const trackRef = useRef<HTMLUListElement | null>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [itemCount, update])

  const page = (direction: 1 | -1) => {
    const el = trackRef.current
    el?.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="relative lg:min-h-0 lg:flex-1">
      {canPrev && (
        <button
          type="button"
          onClick={() => page(-1)}
          aria-label="Videos anteriores"
          className={`${ARROW_CLASS} -left-3`}
        >
          <ChevronLeftIcon aria-hidden className="h-5 w-5" />
        </button>
      )}
      <ul
        ref={trackRef}
        onScroll={update}
        className="-mx-1 flex snap-x lg:h-full snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pt-1 pb-2"
      >
        {children}
      </ul>
      {canNext && (
        <button type="button" onClick={() => page(1)} aria-label="Más videos" className={`${ARROW_CLASS} -right-3`}>
          <ChevronRightIcon aria-hidden className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
