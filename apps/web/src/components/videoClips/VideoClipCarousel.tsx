'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { Match, VideoClip } from '@fulbito/types'
import VideoClipCard from '@/components/videoClips/VideoClipCard'

type Props = {
  clips: VideoClip[]
  matchById: Map<string, Match>
  isAdmin: boolean
  onOpen: (clipId: string) => void
  onDelete: (clipId: string) => void
}

const SCROLL_AMOUNT = 320

export default function VideoClipCarousel({ clips, matchById, isAdmin, onOpen, onDelete }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
  }, [clips, updateScrollState])

  const scrollBy = (amount: number) => {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-SCROLL_AMOUNT)}
          aria-label="Ver clips anteriores"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2 w-8 h-8 rounded-full bg-white border shadow flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand"
        >
          ‹
        </button>
      )}
      <div
        ref={trackRef}
        onScroll={updateScrollState}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
      >
        {clips.map(clip => (
          <div key={clip.id} className="w-32 flex-shrink-0 snap-start">
            <VideoClipCard
              clip={clip}
              match={matchById.get(clip.matchId)}
              isAdmin={isAdmin}
              onOpen={() => onOpen(clip.id)}
              onDelete={() => onDelete(clip.id)}
            />
          </div>
        ))}
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(SCROLL_AMOUNT)}
          aria-label="Ver más clips"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2 w-8 h-8 rounded-full bg-white border shadow flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand"
        >
          ›
        </button>
      )}
    </div>
  )
}
