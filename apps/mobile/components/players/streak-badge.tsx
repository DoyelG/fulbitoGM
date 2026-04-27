import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

type Kind = 'win' | 'loss' | null

function colorForStreak(kind: Kind, count: number): string {
  const c = Math.max(0, Math.min(10, count))
  const t = c / 10
  if (kind === 'win') {
    const s = 60 + 15 * t
    const l = 42 - 8 * t
    return `hsl(145, ${s}%, ${l}%)`
  }
  if (kind === 'loss') {
    const s = 75 + 10 * t
    const l = 50 - 10 * t
    return `hsl(0, ${s}%, ${l}%)`
  }
  return '#9ca3af'
}

type Props = { kind: Kind; count: number }

/** Mini pill de racha: verde para victorias, rojo para derrotas. */
export function StreakBadge({ kind, count }: Props) {
  const { colors } = useAppTheme()
  if (!count || count <= 0 || !kind) {
    return <Text style={[styles.dash, { color: colors.muted }]}>—</Text>
  }
  const label = kind === 'win' ? `W${count}` : `L${count}`
  return (
    <View style={[styles.badge, { backgroundColor: colorForStreak(kind, count) }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  text: {
    color: '#fff',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dash: {
    fontSize: 14,
    fontWeight: '500',
  },
})
