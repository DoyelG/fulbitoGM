'use client'

import { useEffect, useRef, useState } from 'react'
import { PlayIcon } from '@heroicons/react/24/solid'
import { VIDEO_CLIP_CATEGORIES, type VideoClip } from '@fulbito/types'

export type VideoThumbProps = {
  clip: VideoClip
  matchDate?: string
  onOpen: () => void
}

export function clipLabel(clip: VideoClip): string {
  return clip.title || VIDEO_CLIP_CATEGORIES.find((c) => c.value === clip.category)?.label || 'Video'
}

export default function VideoThumb({ clip, matchDate, onOpen }: VideoThumbProps) {
  const ref = useRef<HTMLButtonElement | null>(null)
  const [inView, setInView] = useState(false)
  const meta = VIDEO_CLIP_CATEGORIES.find((c) => c.value === clip.category)
  const label = clipLabel(clip)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView])

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={`Ver video: ${label}${matchDate ? `, ${matchDate}` : ''}`}
      className="group block w-full rounded-xl text-left lg:flex lg:flex-1 lg:flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-night lg:aspect-auto lg:min-h-48 lg:flex-1">
        {inView && (
          <video
            src={`${clip.url}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        )}
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center bg-black/20 transition group-hover:bg-black/40"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-night shadow-lg transition group-hover:scale-110">
            <PlayIcon className="h-5 w-5 translate-x-px" />
          </span>
        </span>
        {meta && (
          <span
            aria-hidden
            className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white"
          >
            {meta.icon} {meta.label}
          </span>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-gray-900">{label}</p>
      {matchDate && <p className="truncate text-xs text-gray-600 first-letter:uppercase">{matchDate}</p>}
    </button>
  )
}
