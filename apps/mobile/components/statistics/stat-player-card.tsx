import { Image, Pressable, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import type { PlayerStatRow, SortTabKey } from '@/hooks/use-player-statistics'
import { styles } from './styles/stat-player-card.styles'

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