import type { Match, Player } from '@fulbito/types'
import { formatLongMatchDate, formatMatchDate, getMatchMvpName, parseMatchDate } from '@fulbito/utils'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { MatchPitch } from '@/components/pitch/match-pitch'
import { PitchCard } from '@/components/pitch/pitch-card'
import { UserAvatar } from '@/components/user-avatar'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './home-last-match-card.styles'

type Props = { match: Match; players: Player[]; matches: Match[] }

const BADGE_AVATAR = 24

function resultLabel(a: number, b: number): string {
  if (a === b) return `Empate ${a} a ${b}`
  return a > b ? `Ganó Equipo A ${a} a ${b}` : `Ganó Equipo B ${b} a ${a}`
}

export function HomeLastMatchCard({ match, players, matches }: Props) {
  const router = useRouter()
  const { colors } = useAppTheme()
  const { teamAScore: a, teamBScore: b } = match
  const date = formatMatchDate(parseMatchDate(match).date)
  const longDate = formatLongMatchDate(match.date)
  const mvpName = getMatchMvpName(match)
  const mvpPlayer = match.mvpId ? players.find((player) => player.id === match.mvpId) : undefined
  const shirtsPlayer = match.shirtsResponsibleId
    ? players.find((player) => player.id === match.shirtsResponsibleId)
    : undefined

  return (
    <PitchCard>
      <View style={styles.heading}>
        <Text style={styles.kicker} accessibilityRole="header">
          ÚLTIMO PARTIDO
        </Text>
        <Text style={styles.longDate}>{longDate.charAt(0).toUpperCase() + longDate.slice(1)}</Text>
      </View>
      <View style={styles.scoreRow} accessible accessibilityLabel={resultLabel(a, b)}>
        <Text style={[styles.team, a > b && styles.winner]} numberOfLines={1}>
          Equipo A
        </Text>
        <Text style={styles.score}>
          {a}
          <Text style={styles.scoreSeparator}>{' : '}</Text>
          {b}
        </Text>
        <Text style={[styles.team, b > a && styles.winner]} numberOfLines={1}>
          Equipo B
        </Text>
      </View>

      <MatchPitch
        teamA={match.teamA}
        teamB={match.teamB}
        players={players}
        matches={matches}
        mvpId={match.mvpId}
        goalkeeperIds={match.goalkeeperIds}
      />

      {(mvpName || shirtsPlayer) && (
        <View style={styles.badges}>
          {mvpName && (
            <View style={styles.badge} accessible accessibilityLabel={`MVP: ${mvpName}`}>
              <UserAvatar imageUrl={mvpPlayer?.photoUrl} size={BADGE_AVATAR} />
              <Text style={styles.badgeText} numberOfLines={1}>
                ⭐ MVP {mvpName}
              </Text>
            </View>
          )}
          {shirtsPlayer && (
            <View style={styles.badge} accessible accessibilityLabel={`Utilero: ${shirtsPlayer.name}`}>
              <UserAvatar imageUrl={shirtsPlayer.photoUrl} size={BADGE_AVATAR} />
              <Text style={styles.badgeText} numberOfLines={1}>
                👕 Utilero: {shirtsPlayer.name}
              </Text>
            </View>
          )}
        </View>
      )}

      <Pressable
        style={[styles.cta, { backgroundColor: colors.secondary }]}
        onPress={() => router.push({ pathname: '/(tabs)/history/[id]', params: { id: match.id } })}
        accessibilityRole="button"
        accessibilityLabel={`Ver partido del ${date}`}
      >
        <Text style={styles.ctaText}>Ver partido</Text>
      </Pressable>
    </PitchCard>
  )
}
