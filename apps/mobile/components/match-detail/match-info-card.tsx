import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import type { Match, Player } from '@fulbito/types'
import { formatLongMatchDate, formatMatchClock, matchLocationMapsUrl, parseMatchDate } from '@fulbito/utils'
import type { ComponentProps, ReactNode } from 'react'
import { Linking, Pressable, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './match-info-card.styles'

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

type Props = {
  match: Match
  playerById: Map<string, Player>
}

function InfoRow({
  icon,
  label,
  children,
  first,
}: {
  icon: IconName
  label: string
  children: ReactNode
  first?: boolean
}) {
  const { colors } = useAppTheme()
  return (
    <View style={[styles.row, first ? null : { borderTopColor: colors.chipBorder, borderTopWidth: 1 }]}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.muted} accessible={false} />
      <View style={styles.rowBody}>
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
        {children}
      </View>
    </View>
  )
}

export function MatchInfoCard({ match, playerById }: Props) {
  const { colors } = useAppTheme()
  const { date, hour } = parseMatchDate(match)
  const longDate = formatLongMatchDate(date)
  const playersCount = match.teamA.length + match.teamB.length
  const shirtsName = match.shirtsResponsibleId ? playerById.get(match.shirtsResponsibleId)?.name : undefined
  const valueStyle = [styles.value, { color: colors.text }]
  const emptyStyle = [styles.emptyValue, { color: colors.muted }]
  const location = match.location

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <InfoRow icon="calendar-blank-outline" label="Fecha" first>
        <Text style={valueStyle}>{longDate.charAt(0).toUpperCase() + longDate.slice(1)}</Text>
      </InfoRow>
      <InfoRow icon="clock-outline" label="Hora">
        {hour !== null ? (
          <Text style={valueStyle}>{formatMatchClock(hour)}</Text>
        ) : (
          <Text style={emptyStyle}>Sin horario</Text>
        )}
      </InfoRow>
      <InfoRow icon="map-marker-outline" label="Cancha">
        {location ? (
          <Pressable
            onPress={() => Linking.openURL(matchLocationMapsUrl(location))}
            hitSlop={{ top: 8, bottom: 8 }}
            accessibilityRole="link"
            accessibilityLabel={`Cancha: ${location.name}, ${location.street}`}
            accessibilityHint="Abre la cancha en el mapa"
          >
            <Text style={[styles.value, styles.link, { color: colors.primaryText }]}>{location.name}</Text>
            {location.street ? <Text style={[styles.street, { color: colors.muted }]}>{location.street}</Text> : null}
          </Pressable>
        ) : (
          <Text style={emptyStyle}>Sin cancha</Text>
        )}
      </InfoRow>
      <InfoRow icon="account-group-outline" label="Modalidad">
        <Text style={valueStyle}>
          {match.type} · {playersCount} {playersCount === 1 ? 'jugador' : 'jugadores'}
        </Text>
      </InfoRow>
      <InfoRow icon="tshirt-crew" label="Lava las remeras">
        {shirtsName ? <Text style={valueStyle}>{shirtsName}</Text> : <Text style={emptyStyle}>Sin asignar</Text>}
      </InfoRow>
      {match.description ? (
        <Text style={[styles.description, { backgroundColor: colors.chipBg, color: colors.textSecondary }]}>
          {match.description}
        </Text>
      ) : null}
    </View>
  )
}
