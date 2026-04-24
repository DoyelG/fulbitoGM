import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

const DONE_BG = 'hsl(270, 80%, 38%)'

type Props = {
  label?: string
}

export function GoalDonePill({ label = 'Objetivo ✓' }: Props) {
  const { isDark, shadows } = useAppTheme()
  return (
    <View
      style={[styles.pill, { backgroundColor: DONE_BG }, isDark && shadows.pill()]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  text: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
