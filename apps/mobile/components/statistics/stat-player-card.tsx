import { Image, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import type { PlayerStatRow, SortTabKey } from '@/hooks/use-player-statistics'

type Props = {
  stat: PlayerStatRow
  rank: number
  activeTab: SortTabKey
  onPress: () => void
}

function getInitials(name: string): string {
  const [first = '', second = ''] = name.trim().split(/\s+/)
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
}

function getFeaturedValue(stat: PlayerStatRow, activeTab: SortTabKey): { value: string; label: string } {
  switch (activeTab) {
    case 'matches':
      return { value: `${stat.matches}`, label: 'PARTIDOS' }
    case 'totalPerformance':
      return { value: stat.totalPerformance.toFixed(2), label: 'REND' }
    case 'winRate':
      return {
        value: `${((stat.wins / Math.max(stat.matches, 1)) * 100).toFixed(1)}%`,
        label: 'VICTORIAS',
      }
    case 'goals':
    default:
      return { value: `${stat.goals}`, label: 'GOLES' }
  }
}

export function StatPlayerCard({ stat, rank, activeTab, onPress }: Props) {
  const { colors, radii } = useAppTheme()
  const featured = getFeaturedValue(stat, activeTab)
  const isFirst = rank === 1

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.xl,
        },
        pressed && { opacity: 0.92 },
      ]}>
      <View style={styles.topRow}>
        <ThemedText style={[styles.rank, { color: isFirst ? '#f59e0b' : colors.muted }]}>
          {rank}
        </ThemedText>

        <View
          style={[
            styles.avatar,
            {
              borderRadius: radii.pill,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderColor: isFirst ? '#f59e0b' : 'transparent',
            },
          ]}>
          {stat.photoUrl ? (
            <Image source={{ uri: stat.photoUrl }} style={styles.avatarImage} />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.initials}>
              {getInitials(stat.name)}
            </ThemedText>
          )}
        </View>

        <View style={styles.mainInfo}>
          <ThemedText numberOfLines={1} style={styles.name}>
            {stat.name}
          </ThemedText>
          <ThemedText style={[styles.record, { color: colors.muted }]}>
            {stat.wins}W - {stat.losses}L - {stat.draws}D
          </ThemedText>
        </View>

        <View style={styles.featured}>
          <ThemedText style={styles.featuredValue}>{featured.value}</ThemedText>
          <ThemedText style={[styles.featuredLabel, { color: colors.muted }]}>
            {featured.label}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <View style={styles.metrics}>
        <View style={styles.metricItem}>
          <ThemedText type="defaultSemiBold" style={styles.metricValue}>
            {stat.matches}
          </ThemedText>
          <ThemedText style={[styles.metricLabel, { color: colors.muted }]}>PARTIDOS</ThemedText>
        </View>
        <View style={styles.metricItem}>
          <ThemedText type="defaultSemiBold" style={styles.metricValue}>
            {(stat.goals / Math.max(stat.matches, 1)).toFixed(2)}
          </ThemedText>
          <ThemedText style={[styles.metricLabel, { color: colors.muted }]}>G/P</ThemedText>
        </View>
        <View style={styles.metricItem}>
          <ThemedText type="defaultSemiBold" style={styles.metricValue}>
            {stat.totalPerformance.toFixed(2)}
          </ThemedText>
          <ThemedText style={[styles.metricLabel, { color: colors.muted }]}>REND</ThemedText>
        </View>
        <View style={styles.metricItem}>
          <ThemedText type="defaultSemiBold" style={styles.metricValue}>
            {((stat.wins / Math.max(stat.matches, 1)) * 100).toFixed(1)}%
          </ThemedText>
          <ThemedText style={[styles.metricLabel, { color: colors.muted }]}>VICTORIAS</ThemedText>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    paddingVertical: 14,      // era 16
    paddingHorizontal: 16,    // era 14
    marginBottom: 0,          // era 12 → moverlo al FlatList ItemSeparator
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,                  // era 10
  },
  rank: {
    width: 24,
    fontSize: 18,             // era 29 → mucho más pequeño
    fontWeight: '700',        // era '800'
    textAlign: 'center',
  },
  avatar: {
    width: 48,                // era 54
    height: 48,               // era 54
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 18,             // era 22
    letterSpacing: 0.4,
  },
  mainInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 20,             // era 33 → el cambio más grande
    fontWeight: '700',
    marginBottom: 2,
  },
  record: {
    fontSize: 13,             // era 21
    fontWeight: '500',        // era '600'
    letterSpacing: 0.2,
  },
  featured: {
    alignItems: 'flex-end',
  },
  featuredValue: {
    color: '#f97316',
    fontWeight: '800',        // era '900'
    fontSize: 32,             // era 42
    lineHeight: 32,           // era 42
  },
  featuredLabel: {
    marginTop: 2,
    fontSize: 11,             // era 16
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    marginVertical: 10,       // era 12
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,                   // era 8
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,             // era 32
    lineHeight: 22,           // era 34
    fontWeight: '700',        // era '800'
  },
  metricLabel: {
    marginTop: 2,
    fontSize: 10,             // era 13
    fontWeight: '600',        // era '700'
    letterSpacing: 0.4,
  },
})
