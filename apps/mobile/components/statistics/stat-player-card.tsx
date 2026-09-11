import { Pressable, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { PlayerAvatar } from '@/components/players/player-avatar'
import { useAppTheme } from '@/hooks/use-theme'
import type { PlayerStatRow, SortTabKey } from '@/hooks/use-player-statistics'
import { styles } from './styles/stat-player-card.styles'

type Props = {
  stat: PlayerStatRow
  rank: number
  activeTab: SortTabKey
  onPress: () => void
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
    case 'mvps':
      return { value: `${stat.mvps}`, label: 'MVP' }
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
      accessibilityRole="button"
      accessibilityLabel={`${stat.name}, puesto ${rank}, ${featured.value} ${featured.label}`}
      accessibilityHint="Abre el perfil del jugador"
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

        <PlayerAvatar
          name={stat.name}
          photoUrl={stat.photoUrl}
          size={48}
        />

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
        <View style={styles.metricItem}>
          <ThemedText type="defaultSemiBold" style={styles.metricValue}>
            {stat.mvps}
          </ThemedText>
          <ThemedText style={[styles.metricLabel, { color: colors.muted }]}>🏆 MVP</ThemedText>
        </View>
      </View>
    </Pressable>
  )
}