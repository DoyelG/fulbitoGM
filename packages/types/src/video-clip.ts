export type VideoClipCategory = 'goal' | 'blooper' | 'highlight' | 'other'

export type VideoClip = {
  id: string
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
  url: string
  createdAt: Date
  updatedAt: Date
}

export type VideoClipCategoryMeta = {
  value: VideoClipCategory
  label: string
  icon: string
}

export const VIDEO_CLIP_CATEGORIES: VideoClipCategoryMeta[] = [
  { value: 'goal', label: 'Gol', icon: '⚽' },
  { value: 'highlight', label: 'Highlight', icon: '🌟' },
  { value: 'blooper', label: 'Blooper', icon: '🤦' },
  { value: 'other', label: 'Otro', icon: '🎬' },
]
