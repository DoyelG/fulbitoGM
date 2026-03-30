import { Paragraph, XStack } from 'tamagui'

type Kind = 'win' | 'loss' | null

function colorForStreak(kind: Kind, count: number) {
  const c = Math.max(0, Math.min(10, count))
  const t = c / 10
  if (kind === 'win') {
    const h = 270
    const s = 70 + 10 * t
    const l = 52 - 16 * t
    return `hsl(${h}deg ${s}% ${l}%)`
  }
  const h = 24
  const s = 80 + 5 * t
  const l = 50 - 12 * t
  return `hsl(${h}deg ${s}% ${l}%)`
}

export function StreakBadge({ kind, count }: { kind: Kind; count: number }) {
  if (!count || count <= 0) {
    return (
      <Paragraph fontSize={14} color="$color.muted">
        —
      </Paragraph>
    )
  }
  const bg = colorForStreak(kind, count)
  const label = kind === 'win' ? `W${count}` : `L${count}`
  return (
    <XStack paddingHorizontal={8} paddingVertical={4} borderRadius={6} backgroundColor={bg}>
      <Paragraph fontSize={12} color="$color.white">
        {label}
      </Paragraph>
    </XStack>
  )
}
