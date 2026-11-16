import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import type { Match } from '@fulbito/types'
import { formatLongMatchDate, parseMatchDate } from '@fulbito/utils'
import { Image } from 'expo-image'
import { Text, View } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { ContrastColors } from '@/constants/theme'

import { styles } from './match-hero.styles'

type Props = {
  match: Match
  tournamentPhotoUrl: string | null
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  )
}

export function MatchHero({ match, tournamentPhotoUrl }: Props) {
  const isDraft = match.status === 'draft'
  const { date } = parseMatchDate(match)
  const winA = !isDraft && match.teamAScore > match.teamBScore
  const winB = !isDraft && match.teamBScore > match.teamAScore
  const title = match.name || formatLongMatchDate(date)

  return (
    <View style={styles.card}>
      <PrimaryGradient />
      <View style={styles.header}>
        <View style={styles.side}>
          <View style={styles.logo}>
            {tournamentPhotoUrl ? (
              <Image
                source={{ uri: tournamentPhotoUrl }}
                style={styles.logoImage}
                contentFit="cover"
                accessible={false}
              />
            ) : (
              <MaterialCommunityIcons name="trophy" size={20} color={ContrastColors.onColorSoft} accessible={false} />
            )}
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2} accessibilityRole="header">
          {title.charAt(0).toUpperCase() + title.slice(1)}
        </Text>
        <View style={[styles.side, styles.badges]}>
          <Badge label={match.type} />
          {match.isFriendly && <Badge label="Amistoso" />}
        </View>
      </View>
      <View style={styles.scoreRow}>
        <Text style={[styles.team, winB ? styles.teamDim : null]} numberOfLines={1}>
          Equipo A
        </Text>
        <View
          style={styles.scoreBox}
          accessible
          accessibilityLabel={
            isDraft ? 'Sin resultado todavía' : `Resultado: ${match.teamAScore} a ${match.teamBScore}`
          }
        >
          <Text style={styles.score}>{isDraft ? '0 – 0' : `${match.teamAScore} – ${match.teamBScore}`}</Text>
        </View>
        <Text style={[styles.team, winA ? styles.teamDim : null]} numberOfLines={1}>
          Equipo B
        </Text>
      </View>
    </View>
  )
}
