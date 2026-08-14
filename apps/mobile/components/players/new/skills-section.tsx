import Slider from '@react-native-community/slider'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Fonts, Spacing } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'

export type SkillKey = 'physical' | 'technical' | 'tactical' | 'psychological'

export type SkillValues = Record<SkillKey, number>

export const SKILLS: { key: SkillKey; label: string; cardLabel: string }[] = [
  { key: 'physical', label: 'Físico', cardLabel: 'FIS' },
  { key: 'technical', label: 'Técnico', cardLabel: 'TEC' },
  { key: 'tactical', label: 'Táctico', cardLabel: 'TAC' },
  { key: 'psychological', label: 'Mental', cardLabel: 'MEN' },
]

const LOW_SKILL_MAX = 5

type Props = {
  values: SkillValues
  onChange: (key: SkillKey, value: number) => void
}

export function SkillsSection({ values, onChange }: Props) {
  const { colors, radii, shadows, isDark } = useAppTheme()
  const trackBg = isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'

  return (
    <>
      {SKILLS.map((s) => {
        const tone = values[s.key] <= LOW_SKILL_MAX ? colors.secondary : colors.brand
        return (
          <View
            key={s.key}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg },
              shadows.card(isDark),
            ]}>
            <View style={styles.header}>
              <ThemedText style={[styles.label, { color: colors.text }]}>{s.label}</ThemedText>
              <ThemedText style={[styles.value, { color: tone }]}>{values[s.key]}</ThemedText>
            </View>
            <Slider
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={values[s.key]}
              onValueChange={(v) => onChange(s.key, v)}
              minimumTrackTintColor={tone}
              maximumTrackTintColor={trackBg}
              thumbTintColor={tone}
              style={styles.slider}
            />
          </View>
        )
      })}
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 15,
    fontFamily: Fonts.extraBoldItalic,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 20,
    fontFamily: Fonts.extraBoldItalic,
  },
  slider: {
    width: '100%',
  },
})
