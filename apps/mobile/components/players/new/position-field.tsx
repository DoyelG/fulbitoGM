import Feather from '@expo/vector-icons/Feather'
import { getPositionLabel, positionOptions } from '@fulbito/utils'
import { useState } from 'react'
import { Platform, StyleSheet, TouchableOpacity } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { ThemedText } from '@/components/themed-text'
import { Fonts, Spacing } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'


type Props = {
  value: string
  onChange: (value: string) => void
}

export function PositionField({ value, onChange }: Props) {
  const { colors, radii } = useAppTheme()
  const [open, setOpen] = useState(false)

  const selectedLabel = getPositionLabel(value)

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Posición: ${selectedLabel}`}
        style={[styles.select, { backgroundColor: colors.chipBg, borderRadius: radii.md }]}>
        <ThemedText style={[styles.selectText, { color: colors.text }]}>{selectedLabel}</ThemedText>
        <Feather name="chevron-down" size={18} color={colors.muted} />
      </TouchableOpacity>

      <BottomSheet visible={open} title="Posición predeterminada" onConfirm={() => setOpen(false)}>
        {positionOptions.map((p) => {
          const active = p.value === value
          return (
            <TouchableOpacity
              key={p.value}
              onPress={() => {
                onChange(p.value)
                setOpen(false)
              }}
              accessibilityRole="button"
              accessibilityLabel={p.label}
              accessibilityState={{ selected: active }}
              style={styles.row}>
              <ThemedText
                style={[
                  styles.rowText,
                  { color: active ? colors.primaryText : colors.text, fontFamily: active ? Fonts.bold : Fonts.medium },
                ]}>
                {p.label}
              </ThemedText>
              {active ? <Feather name="check" size={18} color={colors.primaryText} /> : null}
            </TouchableOpacity>
          )
        })}
      </BottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
  },
  selectText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rowText: {
    fontSize: 16,
  },
})
