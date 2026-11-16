import { MATCH_TYPES, type MatchType } from '@fulbito/types'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { ContrastColors, PrimaryColors } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'

import { FormLabel } from './formLabel'

type Props = {
  value: MatchType
  onChange: (type: MatchType) => void
}

export function TypeSelector({ value, onChange }: Props) {
  const { colors, radii } = useAppTheme()

  return (
    <>
      <FormLabel text="Modo de partido" />
      <View style={styles.row}>
        {MATCH_TYPES.map((type) => {
          const active = type === value
          return (
            <TouchableOpacity
              key={type}
              onPress={() => onChange(type)}
              style={[
                styles.chip,
                {
                  borderColor: active ? PrimaryColors.border : colors.border,
                  borderRadius: radii.sm,
                },
              ]}
            >
              {active && <PrimaryGradient />}
              <Text style={[styles.chipText, { color: active ? ContrastColors.onColor : colors.muted }]}>{type}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
})
