import Feather from '@expo/vector-icons/Feather'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  value: string
  onChange: (next: string) => void
  placeholder?: string
}

/** Input redondeado con icono de búsqueda y botón de limpiar. */
export function PlayersSearchBar({ value, onChange, placeholder = 'Buscar jugador...' }: Props) {
  const { colors, isDark } = useAppTheme()
  const bg = isDark ? colors.chipBg : '#f3f4f6'

  return (
    <View style={[styles.wrap, { backgroundColor: bg, borderColor: colors.border }]}>
      <Feather name="search" size={16} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, { color: colors.text }]}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChange('')} hitSlop={10}>
          <Feather name="x" size={16} color={colors.muted} />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
})
