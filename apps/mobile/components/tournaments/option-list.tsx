import Feather from '@expo/vector-icons/Feather'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './option-list.styles'

export type Option<T> = { value: T; label: string; description?: string }

type Props<T> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  maxHeight?: number
}

export function OptionList<T>({ options, value, onChange, label, maxHeight }: Props<T>) {
  const { colors } = useAppTheme()

  return (
    <ScrollView
      style={[
        styles.list,
        { backgroundColor: colors.chipBg, borderColor: colors.border },
        maxHeight ? { maxHeight } : null,
      ]}
      nestedScrollEnabled
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value
        return (
          <TouchableOpacity
            key={`${String(option.value)}-${index}`}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityHint={option.description}
            accessibilityState={{ checked: isSelected }}
            style={[styles.option, { borderBottomColor: colors.border }]}
          >
            <View style={styles.optionText}>
              <Text style={[styles.label, { color: colors.text }]}>{option.label}</Text>
              {option.description && (
                <Text style={[styles.description, { color: colors.muted }]}>{option.description}</Text>
              )}
            </View>
            {isSelected && <Feather name="check" size={18} color={colors.primaryText} accessible={false} />}
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}
