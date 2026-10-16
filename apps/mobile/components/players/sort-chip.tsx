import * as Haptics from 'expo-haptics'
import { Pressable, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onPress: () => void
  activeColor?: string
  accessibilityLabel?: string
}

export function SortChip({ label, active, dir, onPress, activeColor, accessibilityLabel }: Props) {
  const { colors } = useAppTheme()
  const tint = activeColor ?? colors.brand
  const arrow = active ? (dir === 'asc' ? ' ▲' : ' ▼') : ''

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active }}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? tint : colors.chipBg,
          borderColor: active ? tint : colors.chipBorder,
        },
        pressed && styles.pressed,
      ]}>
      <ThemedText style={[styles.label, { color: active ? '#fff' : colors.muted }]}>
        {label}
        {arrow}
      </ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 40,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
