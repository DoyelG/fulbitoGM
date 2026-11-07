import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'
import { ContrastColors } from '@/constants/theme'

type Kind = 'win' | 'loss' | null

type Props = { kind: Kind; count: number }

export function StreakBadge({ kind, count }: Props) {
  const { colors } = useAppTheme()
  if (!count || count <= 0 || !kind) {
    return <Text style={[styles.dash, { color: colors.muted }]}>—</Text>
  }
  const label = kind === 'win' ? `W${count}` : `L${count}`
  return (
    <View style={[styles.badge, { backgroundColor: kind === 'win' ? colors.primary : colors.secondary }]}>
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
    color: ContrastColors.onColor,
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
