import { SKILL_KEYS, type SkillKey, type TeamSkillAverages } from '@fulbito/utils'
import { Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './match-stats-card.styles'

type TeamStats = { skills: TeamSkillAverages; winProbability: number }

type Props = { teamA: TeamStats; teamB: TeamStats }

type StatRow = { key: string; label: string; a: number | null; b: number | null; isPercent?: boolean }

const SKILL_LABELS: Record<SkillKey, string> = {
  physical: 'Físico',
  technical: 'Técnico',
  tactical: 'Táctico',
  psychological: 'Mental',
}

function format(value: number | null, isPercent = false): string {
  if (value === null) return '—'
  return isPercent ? String(value) : value.toFixed(1)
}

function shareOfA(a: number | null, b: number | null): number | null {
  if (a === null || b === null || a + b === 0) return null
  return (a / (a + b)) * 100
}

function spoken(value: number | null, isPercent = false): string {
  return `${format(value, isPercent)}${isPercent && value !== null ? '%' : ''}`
}

function ComparisonRow({ label, a, b, isPercent, showTeams }: StatRow & { showTeams: boolean }) {
  const { colors } = useAppTheme()
  const share = shareOfA(a, b)
  const valueStyle = [styles.value, { color: colors.text }]
  return (
    <View
      accessible
      accessibilityLabel={`${label}: Equipo A ${spoken(a, isPercent)}, Equipo B ${spoken(b, isPercent)}`}
    >
      {showTeams && (
        <View style={styles.teamsRow}>
          <Text style={[styles.team, { color: colors.primaryText }]}>Equipo A</Text>
          <Text style={[styles.team, { color: colors.secondaryText }]}>Equipo B</Text>
        </View>
      )}
      <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.barRow}>
        <Text style={valueStyle}>{format(a, isPercent)}</Text>
        <View style={[styles.track, { backgroundColor: share === null ? colors.chipBorder : colors.secondarySoft }]}>
          {share !== null && <View style={[styles.fill, { width: `${share}%`, backgroundColor: colors.primary }]} />}
        </View>
        <Text style={valueStyle}>{format(b, isPercent)}</Text>
      </View>
    </View>
  )
}

export function MatchStatsCard({ teamA, teamB }: Props) {
  const { colors } = useAppTheme()
  const rows: StatRow[] = [
    { key: 'win', label: 'Prob. de victoria', a: teamA.winProbability, b: teamB.winProbability, isPercent: true },
    ...SKILL_KEYS.map((key) => ({ key, label: SKILL_LABELS[key], a: teamA.skills[key], b: teamB.skills[key] })),
  ]
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {rows.map((row, index) => (
        <ComparisonRow {...row} key={row.key} showTeams={index === 0} />
      ))}
    </View>
  )
}
