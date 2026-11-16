import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import type { Match } from '@fulbito/types'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './match-highlights-card.styles'

type Props = {
  match: Match
}

export function MatchHighlightsCard({ match }: Props) {
  const { colors } = useAppTheme()
  const router = useRouter()
  const everyone = [
    ...match.teamA.map((player) => ({ ...player, team: 'A' })),
    ...match.teamB.map((player) => ({ ...player, team: 'B' })),
  ]
  const mvp = match.mvpId ? everyone.find((player) => player.id === match.mvpId) : undefined
  const scorers = everyone.filter((player) => player.goals > 0).sort((a, b) => b.goals - a.goals)
  const openPlayer = (playerId: string) => router.push(`/(tabs)/players/${playerId}`)

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {mvp ? (
        <Pressable
          onPress={() => openPlayer(mvp.id)}
          style={[styles.mvp, { backgroundColor: colors.secondarySubtle }]}
          accessibilityRole="link"
          accessibilityLabel={`MVP: ${mvp.name}`}
          accessibilityHint="Abre el perfil del jugador"
        >
          <MaterialCommunityIcons name="trophy" size={28} color={colors.secondary} accessible={false} />
          <View style={styles.mvpBody}>
            <Text style={[styles.mvpLabel, { color: colors.secondaryText }]}>MVP</Text>
            <Text style={[styles.mvpName, { color: colors.text }]} numberOfLines={1}>
              {mvp.name}
            </Text>
          </View>
        </Pressable>
      ) : (
        <Text style={[styles.empty, { color: colors.muted }]}>Sin MVP elegido.</Text>
      )}

      <Text style={[styles.subtitle, { color: colors.text }]}>Goleadores</Text>
      {scorers.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>Nadie hizo goles.</Text>
      ) : (
        scorers.map((player, index) => (
          <Pressable
            key={player.id}
            onPress={() => openPlayer(player.id)}
            style={[styles.scorer, index > 0 ? { borderTopColor: colors.chipBorder, borderTopWidth: 1 } : null]}
            accessibilityRole="link"
            accessibilityLabel={`${player.name}, equipo ${player.team}, ${player.goals} goles`}
          >
            <Text style={[styles.scorerName, { color: colors.text }]} numberOfLines={1}>
              {player.name} <Text style={[styles.scorerTeam, { color: colors.muted }]}>Equipo {player.team}</Text>
            </Text>
            <Text style={[styles.scorerGoals, { color: colors.text }]}>{player.goals} ⚽</Text>
          </Pressable>
        ))
      )}
    </View>
  )
}
