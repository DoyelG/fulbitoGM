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
        <div className="flex items-center justify-center h-20 text-3xl" aria-hidden="true">
          {meta?.icon ?? '🎬'}
        </div>
        <div className="px-2 pb-2 text-center">
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
