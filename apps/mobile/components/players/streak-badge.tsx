import { StyleSheet, Text, View } from 'react-native'

import { useColorScheme } from '@/hooks/use-color-scheme'

type Kind = 'win' | 'loss' | null

function colorForStreak(kind: Kind, count: number): string {
  const c = Math.max(0, Math.min(10, count))
  const t = c / 10
  if (kind === 'win') {
    const s = 70 + 10 * t
    const l = 52 - 16 * t
    return `hsl(270, ${s}%, ${l}%)`
  }
  if (kind === 'loss') {
    const s = 80 + 5 * t
    const l = 50 - 12 * t
    return `hsl(24, ${s}%, ${l}%)`
  }
  return '#9ca3af'
}

type Props = { kind: Kind; count: number }

export function StreakBadge({ kind, count }: Props) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  if (!count || count <= 0 || !kind) {
    return (
      <Text style={[styles.dash, { color: isDark ? '#6b7280' : '#9ca3af' }]}>—</Text>
    )
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dash: {
    fontSize: 15,
    fontWeight: '500',
  },
})
