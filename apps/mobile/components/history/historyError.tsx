import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'
import { PrimaryGradient } from '@/components/primary-gradient'
import { ContrastColors } from '@/constants/theme'

type Props = {
  message: string
  onRetry: () => void
}

export function HistoryError({ message, onRetry }: Props) {
  const { colors, radii } = useAppTheme()
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.title, { color: colors.danger }]}>Error al cargar</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        style={[styles.btn, { borderRadius: radii.sm }]}
      >
        <PrimaryGradient />
        <Text style={styles.btnText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  icon: {
    fontSize: 40,
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  btn: {
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  btnText: {
    color: ContrastColors.onColor,
    fontWeight: '700',
    fontSize: 14,
  },
})
