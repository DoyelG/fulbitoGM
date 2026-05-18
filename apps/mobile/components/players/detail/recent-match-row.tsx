import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import type { RecentMatchEntry } from '@/hooks/use-player-detail'
import { useAppTheme } from '@/hooks/use-theme'
import { Fonts, Radii, Spacing } from '@/constants/theme'

type Props = {
  match: RecentMatchEntry
  showBorder?: boolean
}

function resultColor(result: 'W' | 'L' | 'D'): string {
  if (result === 'W') return '#16a34a'
  if (result === 'L') return '#dc2626'
  return '#6b7280'
}

function resultLabel(result: 'W' | 'L' | 'D'): string {
  if (result === 'W') return 'V'
  if (result === 'L') return 'D'
  return 'E'
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).toUpperCase()
  } catch {
    return dateStr.slice(0, 10)
  }
}

export function RecentMatchRow({ match, showBorder = true }: Props) {
  const { colors } = useAppTheme()
  const color = resultColor(match.result)
  const label = resultLabel(match.result)

  return (
    <View
      style={[
        styles.row,
        showBorder && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}>
      {/* Result badge */}
      <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
        <ThemedText style={[styles.badgeText, { color }]}>{label}</ThemedText>
      </View>

      {/* Date + type */}
      <View style={styles.meta}>
        <ThemedText style={[styles.date, { color: colors.text }]}>
          {formatDate(match.date)}
        </ThemedText>
        <ThemedText style={[styles.type, { color: colors.muted }]}>
          {match.type} · Equipo {match.team}
        </ThemedText>
      </View>

      {/* Score */}
      <ThemedText style={[styles.score, { color: colors.muted }]}>{match.score}</ThemedText>

      {/* Goals + Performance */}
      <View style={styles.stats}>
        <ThemedText style={[styles.statValue, { color: colors.text }]}>
          {match.goals}G
        </ThemedText>
        <ThemedText style={[styles.statValue, { color: colors.muted }]}>
          {match.performance.toFixed(0)}R
        </ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.black,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  date: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },
  type: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  score: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    minWidth: 48,
    textAlign: 'center',
  },
  stats: {
    alignItems: 'flex-end',
    gap: 2,
  },
  statValue: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
})
