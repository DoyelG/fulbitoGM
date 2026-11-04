import Feather from '@expo/vector-icons/Feather'
import type { TournamentPlayerRequest } from '@fulbito/types'
import { getTimeAgo } from '@fulbito/utils'
import { LinearGradient } from 'expo-linear-gradient'
import { Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './player-request-card.styles'
import { PrimaryGradient } from '@/components/primary-gradient'
import { ContrastColors, PrimaryColors } from '@/constants/theme'

type Props = {
  request: TournamentPlayerRequest
  playerName: string | null
  index: number
  disabled: boolean
  onAccept: () => void
  onReject: () => void
}

export function PlayerRequestCard({ request, playerName, index, disabled, onAccept, onReject }: Props) {
  const { colors } = useAppTheme()
  const summary = playerName
    ? `Quiere vincularse con ${playerName}`
    : `Pide un jugador nuevo: ${request.newPlayerName ?? ''}`
  const buttonOpacity = disabled ? 0.5 : 1

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400)}
      layout={LinearTransition}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
      <View style={styles.content}>
        <View style={styles.top}>
          <LinearGradient colors={PrimaryColors.gradient} style={styles.avatar}>
            <Text style={styles.avatarText}>{request.email.charAt(0)}</Text>
          </LinearGradient>
          <View style={styles.info}>
            <View style={styles.metaRow}>
              <View style={[styles.chip, { backgroundColor: colors.chipBg }]}>
                <Feather name="link" size={12} color={colors.primaryText} />
                <Text style={[styles.chipText, { color: colors.primaryText }]}>Vincular jugador</Text>
              </View>
              <Text style={[styles.timeText, { color: colors.muted }]}>{getTimeAgo(request.createdAt)}</Text>
            </View>
            <Text style={[styles.email, { color: colors.text }]} numberOfLines={1}>
              {request.email}
            </Text>
            <Text style={[styles.summary, { color: colors.muted }]}>{summary}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={onReject}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Rechazar la solicitud de ${request.email}`}
            accessibilityState={{ disabled }}
            style={[
              styles.button,
              { backgroundColor: colors.surface, borderColor: colors.danger, opacity: buttonOpacity },
            ]}
          >
            <Feather name="x" size={16} color={colors.danger} />
            <Text style={[styles.buttonText, { color: colors.danger }]}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAccept}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Aceptar la solicitud de ${request.email}`}
            accessibilityState={{ disabled }}
            style={[styles.button, { borderColor: PrimaryColors.border, opacity: buttonOpacity }]}
          >
            <PrimaryGradient />
            <Feather name="check" size={16} color={ContrastColors.onColor} />
            <Text style={[styles.buttonText, { color: ContrastColors.onColor }]}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}
