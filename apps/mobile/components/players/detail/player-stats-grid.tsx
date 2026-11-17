import { View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import type { PlayerDetailStats } from '@/hooks/use-player-detail'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from '@/components/players/detail/player-stats-grid.styles'

type Streak = { kind: 'win' | 'loss' | null; count: number }

type Props = {
  stats: PlayerDetailStats
  streak: Streak
}

function streakValue({ kind, count }: Streak): string {
  if (!kind || count <= 0) return '—'
  return `${kind === 'win' ? 'W' : 'L'}${count}`
}

type StatBoxProps = {
  label: string
  value: string
  sub?: string
  accent?: string
}

function StatBox({ label, value, sub, accent }: StatBoxProps) {
  const { colors, isDark, shadows } = useAppTheme()
  return (
    <View
      accessible
      accessibilityLabel={[label, value, sub].filter(Boolean).join(', ')}
      style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.card(isDark)]}>
      <ThemedText style={[styles.label, { color: colors.text }]}>{label}</ThemedText>
      <View style={styles.valueRow}>
        <ThemedText style={[styles.value, { color: accent ?? colors.text }]}>{value}</ThemedText>
        {sub ? <ThemedText style={[styles.sub, { color: colors.muted }]}>{sub}</ThemedText> : null}
      </View>
    </View>
  )
}

export function PlayerStatsGrid({ stats, streak }: Props) {
  const { colors } = useAppTheme()

  return (
    <View style={styles.grid}>
      <StatBox label="Partidos" value={String(stats.matches)} />
      <StatBox label="Goles" value={String(stats.goals)} sub={`${stats.gpm}/p`} />
      <StatBox label="Victorias" value={String(stats.wins)} sub={`${stats.winRate}%`} />
      <StatBox
        label="Rendimiento"
        value={stats.avgPerformance.toFixed(1)}
        sub={`W${stats.wins} D${stats.draws} L${stats.losses}`}
      />
      <StatBox label="MVP" value={String(stats.mvps)} sub="🏆" />
      <StatBox
        label="Racha"
        value={streakValue(streak)}
        accent={streak.kind === 'win' ? colors.primary : streak.kind === 'loss' ? colors.secondary : undefined}
      />
    </View>
  )
}
