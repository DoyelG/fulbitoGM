import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAppTheme } from '@/hooks/use-theme'

export function PlayersLoading() {
  const { colors } = useAppTheme()

  return (
    <ThemedView style={styles.centered}>
      <View style={[styles.iconWrap, { backgroundColor: colors.brandSoft }]}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        Cargando plantel
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: colors.muted }]}>Un momento…</ThemedText>
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
    marginTop: 8,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
  },
})
