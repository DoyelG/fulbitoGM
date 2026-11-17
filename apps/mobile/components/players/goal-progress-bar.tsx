import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

const BAR = 'hsl(270, 75%, 48%)'

type Props = {
  current: number
  max?: number
}

export function GoalProgressBar({ current, max = 7 }: Props) {
  const { colors } = useAppTheme()
  const capped = Math.max(0, Math.min(max, current))
  const pct = (capped / max) * 100

  return (
    <View style={styles.wrap}>
      <View style={styles.labels}>
        <Text style={[styles.labelSmall, { color: colors.muted }]}>W{capped}</Text>
        <Text style={[styles.labelSmall, { color: colors.muted }]}>{max}</Text>
      </View>
      <View
        style={[
          styles.track,
          { backgroundColor: colors.track },
        ]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: BAR }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: 120,
    maxWidth: '100%',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  track: {
    height: 8,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 99,
  },
})
