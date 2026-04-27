import * as Haptics from 'expo-haptics'
import { Pressable, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onPress: () => void
}

export function SortChip({ label, active, dir, onPress }: Props) {
  const { colors } = useAppTheme()
  const arrow = active ? (dir === 'asc' ? ' ▲' : ' ▼') : ''

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? colors.brandSoftStrong : colors.chipBg,
          borderColor: active ? colors.brand : colors.chipBorder,
        },
        pressed && styles.pressed,
      ]}>
      <ThemedText
        style={[styles.chipText, active && { color: colors.brandAccent }]}>
        {label}
        {arrow}
      </ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
