import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

const FILL = 'hsl(270, 75%, 55%)'

type Props = {
  winCount: number
  max?: number
  width?: number
}

/** Mini barra horizontal + etiqueta `X/max obj` alineada a la derecha. */
export function GoalMiniBar({ winCount, max = 7, width = 80 }: Props) {
  const { colors, isDark } = useAppTheme()
  const capped = Math.max(0, Math.min(max, winCount))
  const pct = (capped / max) * 100
  const trackBg = isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.muted }]}>
        {capped}/{max} obj
      </Text>
      <View style={[styles.track, { width, backgroundColor: trackBg }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: FILL }]} />
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
