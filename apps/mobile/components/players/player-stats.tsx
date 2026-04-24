import { StyleSheet, View } from 'react-native'

import { GoalSevenBar } from '@/components/players/goal-seven-bar'
import { StreakBadge } from '@/components/players/streak-badge'
import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

type StreakKind = 'win' | 'loss' | null

type Props = {
  streak: { kind: StreakKind; count: number }
}

export function PlayerStats({ streak }: Props) {
  const { colors } = useAppTheme()
  const winGoalProgress = streak.kind === 'win' ? streak.count : 0

  return (
    <View style={styles.block}>
      <View style={styles.col}>
        <ThemedText style={[styles.label, { color: colors.muted }]}>Racha</ThemedText>
        {streak.kind ? (
          <StreakBadge kind={streak.kind} count={streak.count} />
        ) : (
          <ThemedText style={[styles.dash, { color: colors.muted }]}>—</ThemedText>
        )}
      </View>
      <View style={styles.col}>
        <ThemedText style={[styles.label, { color: colors.muted }]}>Objetivo 7W</ThemedText>
        <GoalSevenBar winCount={winGoalProgress} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 12,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dash: {
    fontSize: 16,
  },
})
