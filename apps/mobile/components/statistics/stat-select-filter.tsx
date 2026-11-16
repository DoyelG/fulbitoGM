import { useState } from 'react'
import { Pressable } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { sheetStyles } from '@/components/match/matchForm/sharedStyles'
import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import { StatFilterRow } from './stat-filter-row'
import { styles as filterStyles } from './styles/stat-status-filter.styles'

export type StatFilterOption<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  label: string
  value: T
  options: StatFilterOption<T>[]
  onChange: (value: T) => void
  divider?: boolean
}

export function StatSelectFilter<T extends string>({ label, value, options, onChange, divider }: Props<T>) {
  const { colors } = useAppTheme()
  const [open, setOpen] = useState(false)

  const selectedLabel = options.find((option) => option.value === value)?.label ?? ''

  return (
    <>
      <StatFilterRow
        label={label}
        value={selectedLabel}
        onPress={() => setOpen(true)}
        divider={divider}
        active={value !== options[0]?.value}
      />

      <BottomSheet visible={open} title={label} onConfirm={() => setOpen(false)}>
        {options.map((option) => {
          const selected = option.value === value
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value)
                setOpen(false)
              }}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              style={[sheetStyles.option, { borderBottomColor: colors.border }]}
            >
              <ThemedText style={[sheetStyles.optionText, { color: selected ? colors.primaryText : colors.text }]}>
                {option.label}
              </ThemedText>
              {selected && <ThemedText style={[filterStyles.check, { color: colors.primaryText }]}>✓</ThemedText>}
            </Pressable>
          )
        })}
      </BottomSheet>
    </>
  )
}
