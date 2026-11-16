import Feather from '@expo/vector-icons/Feather'
import * as Haptics from 'expo-haptics'
import { Pressable, StyleSheet } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { ThemedText } from '@/components/themed-text'
import { PrimaryColors } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  onPress: () => void
}

const HIT_SLOP = { top: 8, bottom: 8, left: 2, right: 2 }

export function HeaderAddButton({ onPress }: Props) {
  const { colors } = useAppTheme()

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel="Agregar jugador"
      style={({ pressed }) => [
        styles.chip,
        { borderColor: PrimaryColors.border },
        pressed && styles.pressed,
      ]}>
      <PrimaryGradient />
      <Feather name="user-plus" size={14} color={colors.onAccent} />
      <ThemedText style={[styles.label, { color: colors.onAccent }]}>Agregar</ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  label: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
})
