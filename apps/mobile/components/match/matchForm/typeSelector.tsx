import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { FormLabel } from './formLabel'
import { MATCH_TYPES, type MatchType } from './types'

type Props = {
  value: MatchType
  onChange: (t: MatchType) => void
}

export function TypeSelector({ value, onChange }: Props) {
  const { colors, radii } = useAppTheme()

  return (
    <>
      <FormLabel text="Tipo de partido" />
      <View style={styles.row}>
        {MATCH_TYPES.map((t) => {
          const active = t === value
          return (
            <TouchableOpacity
              key={t}
              onPress={() => onChange(t)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.brand : 'transparent',
                  borderColor: active ? colors.brand : colors.border,
                  borderRadius: radii.sm,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : colors.muted }]}>{t}</Text>
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
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
})
