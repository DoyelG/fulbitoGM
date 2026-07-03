import { Platform, StyleSheet, TextInput, View } from 'react-native'

import { PositionField } from '@/components/players/new/position-field'
import { ThemedText } from '@/components/themed-text'
import { Fonts, Spacing } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  name: string
  onChangeName: (value: string) => void
  position: string
  onChangePosition: (value: string) => void
}

export function BasicInfoCard({ name, onChangeName, position, onChangePosition }: Props) {
  const { colors, radii, shadows, isDark } = useAppTheme()

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg },
        shadows.card(isDark),
      ]}>
      <ThemedText style={[styles.label, { color: colors.muted }]}>Nombre del jugador</ThemedText>
      <TextInput
        value={name}
        onChangeText={onChangeName}
        autoCapitalize="words"
        autoCorrect={false}
        placeholder="Ej. Lionel Messi"
        placeholderTextColor={colors.muted}
        underlineColorAndroid="transparent"
        style={[
          styles.input,
          { backgroundColor: colors.chipBg, borderRadius: radii.md, color: colors.text },
        ]}
      />

      <ThemedText style={[styles.label, styles.labelSpaced, { color: colors.muted }]}>
        Posición predeterminada
      </ThemedText>
      <PositionField value={position} onChange={onChangePosition} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  labelSpaced: {
    marginTop: Spacing.lg,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 11,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
})
