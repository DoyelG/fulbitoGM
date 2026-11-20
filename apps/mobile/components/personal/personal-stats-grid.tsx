import type { PersonalSummary } from '@fulbito/utils'
import { Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './personal-stats-grid.styles'

function streakLabel(streak: PersonalSummary['streak']): string {
  if (!streak.kind) return '—'
  const noun = streak.kind === 'win' ? 'V' : 'D'
  return `${streak.count}${noun}`
}

export function PersonalStatsGrid({ summary }: { summary: PersonalSummary }) {
  const { colors } = useAppTheme()
  const stats = [
    { label: 'Partidos', value: String(summary.matches) },
    { label: 'Goles', value: String(summary.goals) },
    { label: 'Goles por partido', value: String(summary.goalsPerMatch) },
    { label: 'Ganados', value: String(summary.wins) },
    { label: 'Empatados', value: String(summary.draws) },
    { label: 'Perdidos', value: String(summary.losses) },
    { label: '% de victorias', value: `${summary.winRate}%` },
    { label: 'Rendimiento medio', value: summary.matches ? String(summary.avgPerformance) : '—' },
    { label: 'Racha actual', value: streakLabel(summary.streak) },
  ]

  return (
    <View style={styles.grid}>
      {stats.map(({ label, value }) => (
        <View
          key={label}
          accessible
          accessibilityLabel={`${label}: ${value}`}
          style={[styles.cell, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.label, { color: colors.muted }]}>{label.toUpperCase()}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        </View>
      ))}
    </View>
  )
}
