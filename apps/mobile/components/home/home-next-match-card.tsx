import Feather from '@expo/vector-icons/Feather'
import type { Match } from '@fulbito/types'
import { formatLongMatchDate, formatMatchClock, matchLocationMapsUrl, parseMatchDate } from '@fulbito/utils'
import { useRouter } from 'expo-router'
import { Linking, Pressable, Text, View } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { ContrastColors, Shadows } from '@/constants/theme'

import { styles } from './home-next-match-card.styles'

type Props = {
  match: Match | null
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function HomeNextMatchCard({ match }: Props) {
  const router = useRouter()

  if (!match) {
    return (
      <View style={[styles.card, Shadows.card(false) as object]}>
        <PrimaryGradient />
        <Text style={styles.eyebrow}>Sin partido</Text>
        <Text style={styles.date}>No hay partido armado</Text>
        <Pressable
          onPress={() => router.navigate('/(tabs)/match')}
          accessibilityRole="button"
          accessibilityLabel="Preparar partido"
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>Preparar partido</Text>
        </Pressable>
      </View>
    )
  }

  const { date, hour } = parseMatchDate(match)
  const longDate = capitalize(formatLongMatchDate(date))
  const location = match.location

  return (
    <View style={[styles.card, Shadows.card(false) as object]}>
      <PrimaryGradient />
      {match.name ? (
        <Text style={styles.eyebrow} numberOfLines={1}>
          {match.name}
        </Text>
      ) : null}
      <Text style={styles.date} accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit>
        {longDate}
      </Text>
      {hour !== null && <Text style={[styles.date, styles.time]}>{formatMatchClock(hour)}hs</Text>}
      {location && (
        <Pressable
          onPress={() => Linking.openURL(matchLocationMapsUrl(location))}
          accessibilityRole="link"
          accessibilityLabel={`Cancha: ${location.name}${location.street ? `, ${location.street}` : ''}`}
          accessibilityHint="Abre la cancha en el mapa"
          hitSlop={{ top: 10, bottom: 10 }}
          style={styles.location}
        >
          <Feather name="map-pin" size={14} color={ContrastColors.onColorMuted} accessible={false} />
          <Text style={styles.locationText} numberOfLines={1}>
            <Text style={styles.locationName}>{location.name}</Text>
            {location.street ? ` · ${location.street}` : ''}
          </Text>
        </Pressable>
      )}
      <Pressable
        onPress={() => router.push({ pathname: '/(tabs)/history/[id]', params: { id: match.id } })}
        accessibilityRole="button"
        accessibilityLabel="Ver partido"
        style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
      >
        <Text style={styles.primaryText}>Ver partido</Text>
      </Pressable>
    </View>
  )
}
