import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

export function HistoryEmpty() {
  const { colors } = useAppTheme()
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🕐</Text>
      <Text style={[styles.title, { color: colors.text }]}>Sin partidos</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Todavía no hay partidos registrados.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
})
