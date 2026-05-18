import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import type { CatSkills } from '@/hooks/use-player-detail'
import { useAppTheme } from '@/hooks/use-theme'
import { Fonts, Radii, Spacing } from '@/constants/theme'

type Props = {
  skills: CatSkills
}

type SkillRowProps = {
  label: string
  value: number
}

const MAX = 10

function skillColor(value: number): string {
  if (value <= 5) {
    const t = (Math.max(1, value) - 1) / 4
    const l = 38 + 14 * t
    return `hsl(24, 85%, ${l}%)`
  }
  const t = (Math.min(10, value) - 6) / 4
  const l = 50 - 14 * t
  return `hsl(270, 78%, ${l}%)`
}

function SkillRow({ label, value }: SkillRowProps) {
  const { colors } = useAppTheme()
  const pct = (value / MAX) * 100
  const color = skillColor(value)

  return (
    <View style={styles.row}>
      <ThemedText style={[styles.label, { color: colors.muted }]}>{label}</ThemedText>
      <View style={[styles.track, { backgroundColor: colors.chipBg, borderColor: colors.chipBorder }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <ThemedText style={[styles.value, { color: colors.text }]}>{value.toFixed(1)}</ThemedText>
    </View>
  )
}

export function PlayerSkillBars({ skills }: Props) {
  return (
    <View style={styles.container}>
      <SkillRow label="Físico" value={skills.physical} />
      <SkillRow label="Técnico" value={skills.technical} />
      <SkillRow label="Táctico" value={skills.tactical} />
      <SkillRow label="Mental" value={skills.psychological} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    width: 64,
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: Radii.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  value: {
    width: 32,
    fontSize: 13,
    fontFamily: Fonts.bold,
    textAlign: 'right',
  },
})
