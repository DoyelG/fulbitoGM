import type { MatchPlayer } from '@fulbito/types'
import { oneDecimal, type TeamTotals } from '@fulbito/utils'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './match-team-card.styles'

export type TeamResult = 'win' | 'loss' | 'draw'

type Props = {
  title: string
  players: MatchPlayer[]
  isDraft: boolean
  result: TeamResult | null
  goalkeeperIds: Set<string>
  mvpId: string | null
  totals: TeamTotals
  winProbability: number
  tone: 'primary' | 'secondary'
}

type FooterStat = { icon: string; label: string; value: string }

const RESULT_LABELS: Record<TeamResult, string> = { win: 'Ganó', loss: 'Perdió', draw: 'Empate' }

function footerStats({ isDraft, players, totals, winProbability }: Props): FooterStat[] {
  if (isDraft) {
    return [
      { icon: '🧠', label: 'Total habilidad', value: String(oneDecimal(totals.skill)) },
      { icon: '💪', label: 'Total físico', value: String(oneDecimal(totals.physical)) },
      { icon: '🏆', label: 'Probabilidad de victoria', value: `${winProbability}%` },
    ]
  }
  const goals = players.reduce((sum, player) => sum + player.goals, 0)
  const rated = players.filter((player) => player.performance > 0)
  const average = rated.length ? rated.reduce((sum, player) => sum + player.performance, 0) / rated.length : 0
  return [
    { icon: '⚽', label: 'Goles', value: String(goals) },
    { icon: '⭐', label: 'Rendimiento promedio', value: rated.length ? String(oneDecimal(average)) : '—' },
  ]
}

export function MatchTeamCard(props: Props) {
  const { title, players, isDraft, result, goalkeeperIds, mvpId, tone } = props
  const { colors } = useAppTheme()
  const router = useRouter()
  const titleColor = tone === 'primary' ? colors.primaryText : colors.secondaryText
  const resultStyle =
    result === 'win'
      ? { backgroundColor: colors.primarySoft, color: colors.primaryText }
      : result === 'loss'
        ? { backgroundColor: colors.secondarySoft, color: colors.secondaryText }
        : { backgroundColor: colors.chipBg, color: colors.muted }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.chipBorder }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: titleColor }]} accessibilityRole="header">
          {title}
        </Text>
        {result && (
          <Text style={[styles.result, resultStyle]} accessibilityLabel={`${title}: ${RESULT_LABELS[result]}`}>
            {RESULT_LABELS[result]}
          </Text>
        )}
      </View>

      {players.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>Sin jugadores</Text>
      ) : (
        <View style={styles.list}>
          {players.map((player) => {
            const isGoalkeeper = goalkeeperIds.has(player.id)
            const isMvp = !isDraft && mvpId === player.id
            const label = [
              player.name,
              isGoalkeeper ? 'arquero' : null,
              isMvp ? 'MVP' : null,
              isDraft ? null : `${player.goals} goles, rendimiento ${player.performance}`,
            ]
              .filter(Boolean)
              .join(', ')
            return (
              <Pressable
                key={player.id}
                onPress={() => router.push(`/(tabs)/players/${player.id}`)}
                style={({ pressed }) => [
                  styles.row,
                  isDraft ? styles.rowCentered : null,
                  { backgroundColor: pressed ? colors.neutralFill : colors.chipBg },
                ]}
                accessibilityRole="link"
                accessibilityLabel={label}
                accessibilityHint="Abre el perfil del jugador"
              >
                <Text
                  style={[styles.name, isDraft ? styles.nameCentered : null, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {player.name}
                  {isGoalkeeper ? ' 🧤' : ''}
                  {isMvp ? ' 🏆' : ''}
                </Text>
                {!isDraft && (
                  <Text style={[styles.stats, { color: colors.muted }]}>
                    {player.goals} ⚽ {player.performance} ⭐
                  </Text>
                )}
              </Pressable>
            )
          })}
        </View>
      )}

      <View style={[styles.footer, { backgroundColor: colors.neutralFill }]}>
        {footerStats(props).map((stat) => (
          <Text
            key={stat.label}
            style={[styles.footerStat, { color: colors.text }]}
            accessibilityLabel={`${stat.label}: ${stat.value}`}
          >
            {stat.icon} {stat.value}
          </Text>
        ))}
      </View>
    </View>
  )
}
