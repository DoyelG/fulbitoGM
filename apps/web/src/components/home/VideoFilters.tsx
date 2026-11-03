import { VIDEO_CLIP_CATEGORIES, type VideoClipCategory } from '@fulbito/types'

export type VideoFilter = VideoClipCategory | 'all'

export type VideoFiltersProps = {
  active: VideoFilter
  counts: Partial<Record<VideoClipCategory, number>>
  total: number
  onChange: (filter: VideoFilter) => void
}

export default function VideoFilters({ active, counts, total, onChange }: VideoFiltersProps) {
  const options = [
    { value: 'all' as const, icon: '', label: 'Todos', count: total },
    ...VIDEO_CLIP_CATEGORIES.filter((c) => (counts[c.value] ?? 0) > 0).map((c) => ({
      value: c.value,
      icon: c.icon,
      label: c.label,
      count: counts[c.value] ?? 0,
    })),
  ]

  return (
    <div role="group" aria-label="Filtrar videos por categoría" className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1">
      {options.map((o) => {
        const selected = o.value === active
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.value)}
            className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              selected ? 'border-night bg-night text-white' : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
            }`}
          >
            {o.icon && <span aria-hidden>{o.icon}</span>}
            {o.label}
            <span className={`tabular-nums ${selected ? 'text-gray-300' : 'text-gray-500'}`}>{o.count}</span>
          </button>
        )
      })}
    </div>
  )
}
