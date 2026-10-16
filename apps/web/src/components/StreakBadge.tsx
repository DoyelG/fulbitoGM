'use client'

type Kind = 'win' | 'loss' | null

function colorForStreak(kind: Kind, count: number) {
  const c = Math.max(0, Math.min(10, count))
  const intensity = c / 10
  if (kind === 'win') {
    const h = 270
    const s = 70 + 10 * intensity
    const l = 52 - 16 * intensity
    return `hsl(${h}deg ${s}% ${l}%)`
  } else {
    const h = 24
    const s = 80 + 5 * intensity
    const l = 50 - 12 * intensity
    return `hsl(${h}deg ${s}% ${l}%)`
  }
}

export default function StreakBadge({ kind, count, muted = false }: { kind: Kind, count: number, muted?: boolean }) {
  if (!count || count <= 0) return <span className={`text-sm ${muted ? 'text-gray-400' : 'text-gray-800'}`}>—</span>
  const label = kind === 'win' ? `W${count}` : `L${count}`
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${muted ? 'bg-gray-200 text-gray-500' : 'text-white'}`}
      style={muted ? undefined : { backgroundColor: colorForStreak(kind, count) }}
    >
      {label}
    </span>
  )
}