import * as Haptics from 'expo-haptics'
import { Pressable, ScrollView, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

export type PositionFilter = string | null

const ORDER = ['GK', 'DEF', 'MID', 'FWD', 'PLAYER']

type Props = {
  positions: string[]
  value: PositionFilter
  onChange: (next: PositionFilter) => void
}

/** Chips horizontales para filtrar por posición; `null` = Todos. */
export function PositionFilterRow({ positions, value, onChange }: Props) {
  const sorted = [...positions].sort((a, b) => {
    const ia = ORDER.indexOf(a)
    const ib = ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      <Chip label="Todos" active={value === null} onPress={() => onChange(null)} />
      {sorted.map((pos) => (
        <Chip
          key={pos}
          label={pos}
          active={value === pos}
          onPress={() => onChange(pos)}
        />
      ))}
    </ScrollView>
  )
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  const { colors } = useAppTheme()
  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? colors.brand : colors.chipBg,
          borderColor: active ? colors.brand : colors.chipBorder,
        },
        pressed && styles.pressed,
      ]}>
      <ThemedText
        style={[
          styles.chipText,
          { color: active ? '#fff' : colors.muted },
        ]}>
        {label}
      </ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
