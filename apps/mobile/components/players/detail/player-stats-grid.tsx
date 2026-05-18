import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import type { PlayerDetailStats } from '@/hooks/use-player-detail'
import { useAppTheme } from '@/hooks/use-theme'
import { Fonts, Radii, Spacing } from '@/constants/theme'

type Props = {
  stats: PlayerDetailStats
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
      style={[
        styles.box,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        shadows.card(isDark),
      ]}>
      <ThemedText style={[styles.value, { color: accent ?? colors.text }]}>{value}</ThemedText>
      {sub ? (
        <ThemedText style={[styles.sub, { color: colors.muted }]}>{sub}</ThemedText>
      ) : null}
      <ThemedText style={[styles.label, { color: colors.muted }]}>{label}</ThemedText>
    </View>
  )
}

export function PlayerStatsGrid({ stats }: Props) {
  const { colors } = useAppTheme()

  const winsColor =
    stats.wins > stats.losses ? '#16a34a' : stats.losses > stats.wins ? colors.danger : colors.muted

  return (
    <View style={styles.grid}>
      <StatBox label="Partidos" value={String(stats.matches)} />
      <StatBox label="Goles" value={String(stats.goals)} sub={`${stats.gpm}/p`} />
      <StatBox
        label="Victorias"
        value={String(stats.wins)}
        sub={`${stats.winRate}%`}
        accent={winsColor}
      />
      <StatBox
        label="Rendimiento"
        value={stats.avgPerformance.toFixed(1)}
        sub={`W${stats.wins} D${stats.draws} L${stats.losses}`}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  box: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontSize: 22,
    fontFamily: Fonts.extraBold,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  label: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
})
