import Feather from '@expo/vector-icons/Feather'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  message: string
  onRetry: () => void
}

/** Estado de error con botón de reintento. */
export function PlayersError({ message, onRetry }: Props) {
  const { colors, shadows } = useAppTheme()

  return (
    <ThemedView style={styles.centered}>
      <View style={[styles.iconWrap, { backgroundColor: colors.brandSoft }]}>
        <Feather name="wifi-off" size={32} color={colors.warning} />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        No se pudo conectar
      </ThemedText>
      <ThemedText style={[styles.message, { color: colors.muted }]}>{message}</ThemedText>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retryBtn,
          { backgroundColor: colors.brand },
          shadows.cta(colors.brand),
          pressed && styles.retryBtnPressed,
        ]}>
        <ThemedText style={styles.retryBtnText}>Reintentar</ThemedText>
      </Pressable>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryBtnPressed: {
    transform: [{ scale: 0.98 }],
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
})
