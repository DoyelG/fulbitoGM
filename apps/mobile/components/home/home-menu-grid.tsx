import { Fonts, Radii, Spacing } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const MENU_ITEMS = [
  { label: 'Historial', icon: 'time-outline' as const, href: '/(tabs)/history' },
  { label: 'Jugadores', icon: 'people-outline' as const, href: '/(tabs)/players' },
  { label: 'Nuevo Partido', icon: 'football-outline' as const, href: '/(tabs)/match' },
  { label: 'Estadísticas', icon: 'bar-chart-outline' as const, href: '/(tabs)/statistics' },
]

export function HomeMenuGrid() {
  const { colors: C } = useAppTheme()
  const router = useRouter()

  return (
    <View style={styles.grid}>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={[styles.card, { backgroundColor: C.brand }]}
          activeOpacity={0.75}
          onPress={() => router.push(item.href as any)}
        >
          <Ionicons name={item.icon} size={32} color="rgba(255,255,255,0.9)" />
          <Text style={styles.label}>{item.label.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  card: {
    flex: 1,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 6,
  },
  label: {
    fontFamily: Fonts.extraBold,
    fontSize: 9,
    letterSpacing: 0.3,
    color: '#fff',
    textAlign: 'center',
  },
})
