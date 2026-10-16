import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  skill: number | null
  isGoalkeepingMode: boolean
}

export function SkillBig({ skill, isGoalkeepingMode = false}: Props) {
  const { colors, isDark } = useAppTheme()

  if (skill === null || skill === undefined || Number.isNaN(skill)) {
    return (
      <View style={[styles.unknownPill, { backgroundColor: isDark ? colors.chipBg : 'rgba(0,0,0,0.06)' }]}>
        <Text style={[styles.unknownText, { color: colors.muted }]}>—</Text>
      </View>
    )
  }

  return (
    <View style={styles.row}>
      <Text style={[styles.number, { color: '#fff' }]}>
        {skill.toFixed(2)}
      </Text>
      <Text style={[styles.suffix, { color: 'rgba(255,255,255,0.85)' }]}>lv{isGoalkeepingMode ? '🧤' : ''}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  number: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  suffix: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  unknownPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  unknownText: {
    fontSize: 13,
    fontWeight: '700',
  },
})
