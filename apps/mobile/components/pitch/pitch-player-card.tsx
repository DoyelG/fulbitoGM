import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Pressable, Text, View, type ViewStyle } from 'react-native'

import { PitchColors } from '@/constants/theme'

import { styles } from './pitch-player-card.styles'

export type PitchPlayerCardData = {
  name: string
  position?: string
  teamLabel: string
  isMvp: boolean
  tournament?: { matches: number; goals: number; mvps: number }
  match?: { goals: number; performance: number }
}

type Props = {
  data: PitchPlayerCardData
  placement: Pick<ViewStyle, 'left' | 'top' | 'bottom' | 'width'>
  onOpenProfile: () => void
  onClose: () => void
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

function goalsLabel(goals: number): string {
  return goals === 0 ? 'sin goles' : plural(goals, 'gol', 'goles')
}

export function PitchPlayerCard({ data, placement, onOpenProfile, onClose }: Props) {
  const subtitle =
    [data.position, data.teamLabel].filter(Boolean).join(' · ') + (data.isMvp ? ' · MVP del partido' : '')
  return (
    <>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cerrar datos del jugador"
      />
      <View style={[styles.card, placement]} accessibilityViewIsModal accessibilityLiveRegion="polite">
        <View style={styles.header}>
          <Text style={styles.name} accessibilityRole="header">
            {data.name}
          </Text>
          <Pressable
            onPress={onOpenProfile}
            style={({ pressed }) => [styles.profileBtn, pressed && styles.profileBtnPressed]}
            accessibilityRole="link"
            accessibilityLabel={`Ver ficha de ${data.name}`}
          >
            <MaterialIcons name="north-east" size={18} color={PitchColors.cardLabel} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {data.tournament && (
          <>
            <Text style={styles.label}>En el torneo</Text>
            <Text style={styles.value}>
              {plural(data.tournament.matches, 'partido', 'partidos')} · {plural(data.tournament.goals, 'gol', 'goles')}{' '}
              · {data.tournament.mvps} MVP
            </Text>
          </>
        )}
        {data.match && (
          <>
            <View style={styles.divider} />
            <Text style={styles.label}>Este partido</Text>
            <Text style={styles.value}>
              ⚽ {goalsLabel(data.match.goals)} · ⭐ {data.match.performance} de rendimiento
            </Text>
          </>
        )}
      </View>
    </>
  )
}
