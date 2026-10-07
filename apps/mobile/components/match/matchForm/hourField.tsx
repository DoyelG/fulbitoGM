import Feather from '@expo/vector-icons/Feather'
import { MATCH_HOUR_OPTIONS, formatMatchClock } from '@fulbito/utils'
import { useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { BottomSheet } from './bottomSheet'
import { FormLabel } from './formLabel'
import { styles } from './hourField.styles'
import { fieldStyles, sheetStyles } from './sharedStyles'

const OPTIONS: (number | null)[] = [null, ...MATCH_HOUR_OPTIONS]

type Props = {
  value: number | null
  onChange: (hour: number | null) => void
}

export function HourField({ value, onChange }: Props) {
  const { colors, radii } = useAppTheme()
  const [open, setOpen] = useState(false)

  return (
    <>
      <FormLabel text="Hora" />
      <TouchableOpacity
        style={[fieldStyles.inputBtn, styles.input, { borderColor: colors.border, borderRadius: radii.sm }]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Hora del partido"
        accessibilityHint="Abre el selector de hora"
      >
        <View style={styles.valueRow}>
          <Text style={[fieldStyles.inputBtnText, { color: value === null ? colors.muted : colors.text }]}>
            {value === null ? 'Sin hora' : formatMatchClock(value)}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.muted} />
        </View>
      </TouchableOpacity>
      <BottomSheet
        visible={open}
        title="Seleccionar hora"
        onConfirm={() => setOpen(false)}
        onDismiss={() => setOpen(false)}
        containerStyle={styles.sheet}
      >
        <FlatList
          data={OPTIONS}
          keyExtractor={(item) => String(item)}
          renderItem={({ item }) => {
            const active = value === item
            return (
              <TouchableOpacity
                style={[sheetStyles.option, { borderBottomColor: colors.border }]}
                onPress={() => {
                  onChange(item)
                  setOpen(false)
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={item === null ? 'Sin hora' : formatMatchClock(item)}
              >
                <Text
                  style={[
                    sheetStyles.optionText,
                    { color: active ? colors.brand : colors.text, fontWeight: active ? '700' : '400' },
                  ]}
                >
                  {item === null ? 'Sin hora' : formatMatchClock(item)}
                </Text>
                {active ? <Feather name="check" size={18} color={colors.brand} /> : null}
              </TouchableOpacity>
            )
          }}
        />
      </BottomSheet>
    </>
  )
}
