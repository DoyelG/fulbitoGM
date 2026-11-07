import { PrimaryGradient } from '@/components/primary-gradient'
import { ContrastColors, Fonts, PrimaryColors, Radii, Spacing } from '@/constants/theme'
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
  const router = useRouter()

  return (
    <View style={styles.grid}>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.card}
          activeOpacity={0.75}
          onPress={() => router.push(item.href as any)}
        >
          <PrimaryGradient />
          <Ionicons name={item.icon} size={32} color={ContrastColors.onColorSoft} />
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
    borderWidth: 1,
    borderColor: PrimaryColors.border,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 6,
  },
  label: {
    fontFamily: Fonts.extraBold,
    fontSize: 9,
    letterSpacing: 0.3,
    color: ContrastColors.onColor,
    textAlign: 'center',
  },
})
