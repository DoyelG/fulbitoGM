import { StyleSheet, Text, View } from 'react-native'

import { useColorScheme } from '@/hooks/use-color-scheme'

function colorForSkill(skill: number): string {
  if (skill <= 5) {
    const t = (Math.max(1, skill) - 1) / 4
    const l = 38 + 14 * t
    return `hsl(24, 85%, ${l}%)`
  }
  const t = (Math.min(10, skill) - 6) / 4
  const l = 50 - 14 * t
  return `hsl(270, 78%, ${l}%)`
}

type Props = { skill: number | 'unknown' }

export function SkillBadge({ skill }: Props) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  if (skill === 'unknown') {
    return (
      <View
        style={[
          styles.badge,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
        ]}>
        <Text style={[styles.unknownText, { color: isDark ? '#d1d5db' : '#4b5563' }]}>Unknown</Text>
      </View>
    )
  }
  return (
    <View style={[styles.badge, { backgroundColor: colorForSkill(skill) }]}>
      <Text style={styles.text}>Lv {skill}</Text>
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
  unknownText: {
    fontSize: 12,
    fontWeight: '600',
  },
})
