import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Pressable, TouchableOpacity } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { sheetStyles } from '@/components/match/matchForm/sharedStyles'
import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import { styles } from './styles/stat-status-filter.styles'

export type PlayerStatusFilter = 'all' | 'active' | 'inactive'

type Props = {
  value: PlayerStatusFilter
  onChange: (value: PlayerStatusFilter) => void
}

const OPTIONS: { key: PlayerStatusFilter; label: string }[] = [
  { key: 'all', label: 'Todos los jugadores' },
  { key: 'active', label: 'Solo los activos' },
  { key: 'inactive', label: 'Solo los inactivos' },
]

export function StatStatusFilter({ value, onChange }: Props) {
  const { colors, radii, spacing, isDark } = useAppTheme()
  const [open, setOpen] = useState(false)

  const textColor = isDark ? colors.text : '#4b5563'
  const selectedLabel =OPTIONS.find((option) => option.key === value)?.label ?? ''

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Estado del jugador: ${selectedLabel}`}
        accessibilityHint="Abre la lista para filtrar por estado de jugador"
        style={[
          styles.select,
          styles.wrapper,
          {
            backgroundColor: colors.chipBg,
            borderColor: colors.chipBorder,
            borderRadius: radii.pill,
            paddingHorizontal: spacing.lg,
          },
        ]}>
        <Ionicons name="options-outline" size={16} color={textColor} style={styles.icon} />
        <ThemedText style={[styles.selectText, { color: textColor }]}>{selectedLabel}</ThemedText>
      </TouchableOpacity>

      <BottomSheet visible={open} title="Filtrar por estado" onConfirm={() => setOpen(false)}>
        {OPTIONS.map((option) => {
          const selected = option.key === value
          return (
            <Pressable
              key={option.key}
              onPress={() => {
                onChange(option.key)
                setOpen(false)
              }}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              style={[sheetStyles.option, { borderBottomColor: colors.border }]}>
              <ThemedText style={[sheetStyles.optionText, { color: selected ? colors.brand : colors.text }]}>
                {option.label}
              </ThemedText>
              {selected && <ThemedText style={{ color: colors.brand, fontWeight: '700', fontSize: 16 }}>✓</ThemedText>}
            </Pressable>
          )
        })}
      </BottomSheet>
    </>
  )
}