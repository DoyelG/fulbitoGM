import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  winCount: number
  max?: number
  width?: number
}

export function GoalMiniBar({ winCount, max = 7, width = 80 }: Props) {
  const { colors } = useAppTheme()
  const capped = Math.max(0, Math.min(max, winCount))
  const pct = (capped / max) * 100

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.onAccentSoft }]}>
        {capped}/{max} obj
      </Text>
      <View style={[styles.track, { width, backgroundColor: colors.onAccentTrack }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors.onAccent }]} />
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
  },
  track: {
    height: 4,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 99,
  },
})
