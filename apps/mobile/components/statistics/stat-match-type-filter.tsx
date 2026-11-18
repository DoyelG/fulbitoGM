import { MATCH_TYPES, type MatchType } from '@fulbito/types'
import { useState } from 'react'
import { Pressable, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { ThemedText } from '@/components/themed-text'
import { ContrastColors, PrimaryColors } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'
import { StatFilterRow } from './stat-filter-row'
import { styles } from './styles/stat-filters.styles'

type Props = {
  value: MatchType[]
  onChange: (types: MatchType[]) => void
  divider?: boolean
}

const summarize = (types: MatchType[]) => {
  if (types.length === 0) return 'Todos'
  if (types.length <= 2) return types.join(', ')
  return `${types.length} modos`
}

export function StatMatchTypeFilter({ value, onChange, divider }: Props) {
  const { colors, radii } = useAppTheme()
  const [open, setOpen] = useState(false)

  const toggleMatchType = (type: MatchType) => {
    const next = value.includes(type) ? value.filter((item) => item !== type) : [...value, type]
    onChange(next.length === MATCH_TYPES.length ? [] : next)
  }

  return (
    <>
      <StatFilterRow
        label="Modo de partido"
        value={summarize(value)}
        onPress={() => setOpen(true)}
        divider={divider}
        active={value.length > 0}
      />

      <BottomSheet visible={open} title="Modo de partido" onConfirm={() => setOpen(false)}>
        <View style={styles.chips}>
          {[null, ...MATCH_TYPES].map((type) => {
            const selected = type === null ? value.length === 0 : value.includes(type)
            const label = type ?? 'Todos'
            return (
              <Pressable
                key={label}
                onPress={() => (type === null ? onChange([]) : toggleMatchType(type))}
                accessibilityRole="button"
                accessibilityLabel={`Modo ${label}`}
                accessibilityState={{ selected }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.primary : 'transparent',
                    borderColor: selected ? PrimaryColors.border : colors.border,
                    borderRadius: radii.sm,
                  },
                ]}
              >
                <ThemedText style={[styles.chipText, { color: selected ? ContrastColors.onColor : colors.muted }]}>
                  {label}
                </ThemedText>
              </Pressable>
            )
          })}
        </View>
      </BottomSheet>
    </>
  )
}
