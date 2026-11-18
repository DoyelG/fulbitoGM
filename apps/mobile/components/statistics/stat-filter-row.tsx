import { Ionicons } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import { styles } from './styles/stat-filters.styles'

type Props = {
  label: string
  value: string
  onPress: () => void
  divider?: boolean
  active?: boolean
}

export function StatFilterRow({ label, value, onPress, divider = false, active = false }: Props) {
  const { colors } = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      accessibilityHint={`Abre las opciones de ${label.toLowerCase()}`}
      style={[
        styles.row,
        divider && [styles.rowDivider, { borderBottomColor: colors.border }],
        active && { backgroundColor: colors.primarySoft },
      ]}
    >
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <View style={styles.rowValue}>
        <ThemedText
          numberOfLines={1}
          style={[
            styles.rowValueText,
            { color: active ? colors.primaryText : colors.muted },
            active && styles.rowValueActive,
          ]}
        >
          {value}
        </ThemedText>
        <Ionicons name="chevron-forward" size={16} color={active ? colors.primaryText : colors.muted} />
      </View>
    </Pressable>
  )
}
