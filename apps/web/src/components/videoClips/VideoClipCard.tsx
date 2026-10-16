'use client'

import type { Match, VideoClip } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'

type Props = {
  clip: VideoClip
  match: Match | undefined
  isAdmin: boolean
  onOpen: () => void
  onDelete: () => void
}

export default function VideoClipCard({ clip, match, isAdmin, onOpen, onDelete }: Props) {
  const meta = VIDEO_CLIP_CATEGORIES.find(c => c.value === clip.category)
  const label = clip.title || meta?.label || 'Clip'

  return (
    <div className="relative rounded-lg border bg-gray-50">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
        aria-label={`Ver clip: ${label}`}
      >
        <div className="relative h-24 bg-black rounded-t-lg overflow-hidden">
          <video
            src={`${clip.url}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="w-full h-full object-cover pointer-events-none"
          />
          <span
            className="absolute bottom-1 left-1 text-xs bg-black/70 text-white rounded px-1.5 py-0.5 flex items-center gap-1"
            aria-hidden="true"
          >
            {meta?.icon ?? '🎬'}
          </span>
        </div>
        <div className="px-2 pb-2 pt-1 text-center">
          <div className="text-xs font-medium truncate">{label}</div>
          {match && (
            <div className="text-[10px] text-gray-700">
              {new Date(match.date).toLocaleDateString()}
            </div>
          )}
        </div>
      </button>
      {isAdmin && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Eliminar clip: ${label}`}
          className="absolute top-1 right-1 z-10 text-xs bg-white/90 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          🗑
        </button>
      )}
    </div>
  )
}
