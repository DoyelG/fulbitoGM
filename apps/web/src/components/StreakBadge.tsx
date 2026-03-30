'use client'

type Kind = 'win' | 'loss' | null

// Fixed hues; vary only intensity (lightness) and a touch of saturation by count
function colorForStreak(kind: Kind, count: number) {
  const c = Math.max(0, Math.min(10, count))
  const t = c / 10 // 0..1
  if (kind === 'win') {
    const h = 270
    const s = 70 + 10 * t // 70%→80%
    const l = 52 - 16 * t // 52%→36% darker with more wins
    return `hsl(${h}deg ${s}% ${l}%)`
  } else {
    const h = 24
    const s = 80 + 5 * t // 80%→85%
    const l = 50 - 12 * t // 50%→38% darker with more losses
    return `hsl(${h}deg ${s}% ${l}%)`
  }
}

export default function StreakBadge({ kind, count }: { kind: Kind, count: number }) {
  if (!count || count <= 0) return <span className="text-sm text-gray-800">—</span>
  const bg = colorForStreak(kind, count)
  const label = kind === 'win' ? `W${count}` : `L${count}`
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: bg }}>{label}</span>
}