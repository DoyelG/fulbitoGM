import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import type { ComponentProps } from 'react'
import { Pressable, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { PlayerAvatar } from '@/components/players/player-avatar'
import { useAppTheme } from '@/hooks/use-theme'
import type { PlayerStatRow, SortTabKey } from '@/hooks/use-player-statistics'
import { styles } from './styles/stat-player-card.styles'

type MetricIcon = ComponentProps<typeof MaterialCommunityIcons>['name']

type Props = {
  stat: PlayerStatRow
  rank: number
  activeTab: SortTabKey
  inactive?: boolean
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

export function StatPlayerCard({ stat, rank, activeTab, inactive = false, onPress }: Props) {
  const { colors, radii } = useAppTheme()
  const featured = getFeaturedValue(stat, activeTab)
  const isFirst = !inactive && rank === 1
  const muted = inactive ? { color: colors.muted } : null
  const metrics: { icon: MetricIcon; label: string; value: string }[] = [
    { icon: 'soccer-field', label: 'Partidos', value: `${stat.matches}` },
    { icon: 'soccer', label: 'Goles por partido', value: (stat.goals / Math.max(stat.matches, 1)).toFixed(2) },
    { icon: 'star-outline', label: 'Rendimiento', value: stat.totalPerformance.toFixed(2) },
    {
      icon: 'percent-circle-outline',
      label: 'Victorias',
      value: `${((stat.wins / Math.max(stat.matches, 1)) * 100).toFixed(1)}%`,
    },
    { icon: 'trophy-outline', label: 'MVP', value: `${stat.mvps}` },
  ]

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${stat.name}${inactive ? ', inactivo' : ''}, puesto ${rank}, ${featured.value} ${featured.label}`}
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
        <ThemedText style={[styles.rank, { color: isFirst ? colors.medal : colors.muted }]}>
          {rank}
        </ThemedText>

        <PlayerAvatar
          name={stat.name}
          photoUrl={stat.photoUrl}
          size={48}
        />

        <View style={styles.mainInfo}>
          <ThemedText numberOfLines={1} style={[styles.name, muted]}>
            {stat.name}
          </ThemedText>
          <ThemedText style={[styles.record, { color: colors.muted }]}>
            {stat.wins}W - {stat.losses}L - {stat.draws}D
          </ThemedText>
        </View>

        <View style={styles.featured}>
          <ThemedText style={[styles.featuredValue, muted]}>{featured.value}</ThemedText>
          <ThemedText style={[styles.featuredLabel, { color: colors.muted }]}>
            {featured.label}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <View style={styles.metrics}>
          {metrics.map((metric) => (
            <View
              key={metric.label}
              style={styles.metricItem}
              accessible
              accessibilityLabel={`${metric.label}: ${metric.value}`}
            >
              <MaterialCommunityIcons
                name={metric.icon}
                size={18}
                color={colors.muted}
                style={styles.metricIcon}
                accessible={false}
              />
              <ThemedText type="defaultSemiBold" style={[styles.metricValue, muted]}>
                {metric.value}
              </ThemedText>
            </View>
          ))}
        </View>
    </Pressable>
  )
}
