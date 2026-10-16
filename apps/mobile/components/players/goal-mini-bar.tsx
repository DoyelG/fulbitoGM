import { StyleSheet, Text, View } from 'react-native'

type Props = {
  winCount: number
  max?: number
  width?: number
}

export function GoalMiniBar({ winCount, max = 7, width = 80 }: Props) {
  const capped = Math.max(0, Math.min(max, winCount))
  const pct = (capped / max) * 100

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {capped}/{max} obj
      </Text>
      <View style={[styles.track, { width }]}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  track: {
    height: 4,
    borderRadius: 99,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  fill: {
    height: 4,
    borderRadius: 99,
    backgroundColor: '#fff',
  },
})
