import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

export function HistoryLoading() {
  const { colors } = useAppTheme()
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.brand} />
      <Text style={[styles.text, { color: colors.muted }]}>Cargando historial…</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontSize: 14,
  },
})
