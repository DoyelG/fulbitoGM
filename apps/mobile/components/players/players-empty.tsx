import Feather from '@expo/vector-icons/Feather'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  isAdmin: boolean
  onCreate: () => void
}

export function PlayersEmpty({ isAdmin, onCreate }: Props) {
  const { colors } = useAppTheme()

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: colors.brandSoft }]}>
        <Feather name="user-plus" size={36} color={colors.brand} style={{ opacity: 0.9 }} />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        Sin jugadores todavía
      </ThemedText>
      <ThemedText style={[styles.text, { color: colors.muted }]}>
        No hay jugadores cargados.
        {isAdmin ? ' Creá el primero con el botón Agregar arriba.' : ''}
      </ThemedText>
      {isAdmin && (
        <Pressable
          onPress={onCreate}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: colors.brand },
            pressed && { opacity: 0.9 },
          ]}>
          <ThemedText style={styles.ctaText}>Nuevo jugador</ThemedText>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
})
