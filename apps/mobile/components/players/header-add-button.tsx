import Feather from '@expo/vector-icons/Feather'
import * as Haptics from 'expo-haptics'
import { Pressable, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  onPress: () => void
}

export function HeaderAddButton({ onPress }: Props) {
  const { colors } = useAppTheme()

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      hitSlop={12}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: colors.brand },
        pressed && { opacity: 0.9 },
      ]}>
      <Feather name="user-plus" size={16} color="#fff" />
      <ThemedText style={styles.text}>Agregar</ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pill: {
    marginRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
})
