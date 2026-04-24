import { StyleSheet, Text, View } from 'react-native'

import { useColorScheme } from '@/hooks/use-color-scheme'

const BAR = 'hsl(270, 75%, 48%)'
const DONE_BG = 'hsl(270, 80%, 38%)'

type Props = { winCount: number }

/** Progreso hacia 7 victorias consecutivas (misma lógica que la web). */
export function GoalSevenBar({ winCount }: Props) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const labelColor = isDark ? '#9ca3af' : '#6b7280'

  const capped = Math.min(7, winCount)
  if (winCount >= 7) {
    return (
      <View
        style={[
          styles.donePill,
          { backgroundColor: DONE_BG },
          isDark && styles.donePillShadow,
        ]}>
        <Text style={styles.doneText}>Objetivo ✓</Text>
      </View>
    )
  }
  const pct = (capped / 7) * 100
  return (
    <View style={styles.wrap}>
      <View style={styles.labels}>
        <Text style={[styles.labelSmall, { color: labelColor }]}>W{capped}</Text>
        <Text style={[styles.labelSmall, { color: labelColor }]}>7</Text>
      </View>
      <View style={[styles.track, isDark && styles.trackDark]}>
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
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  trackDark: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  fill: {
    height: 8,
    borderRadius: 99,
  },
  donePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  donePillShadow: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  doneText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
