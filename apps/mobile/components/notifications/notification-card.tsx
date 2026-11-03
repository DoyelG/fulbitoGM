import Feather from '@expo/vector-icons/Feather'
import type { RoleRequestNotification } from '@fulbito/types'
import { getRoleRequestLabel, getRoleRequestSummary, getTimeAgo } from '@fulbito/utils'
import { LinearGradient } from 'expo-linear-gradient'
import { Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './notification-card.styles'

type Props = {
  notification: RoleRequestNotification
  index: number
  disabled: boolean
  onAccept: () => void
  onReject: () => void
}

export function NotificationCard({ notification, index, disabled, onAccept, onReject }: Props) {
  const { colors } = useAppTheme()
  const { userEmail, requestedRole } = notification.data
  const isAdminRequest = requestedRole === 'ADMIN'
  const typeColor = isAdminRequest ? colors.secondary : colors.brand
  const buttonOpacity = disabled ? 0.5 : 1

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400)}
      layout={LinearTransition}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.accentBar, { backgroundColor: typeColor }]} />
      <View style={styles.content}>
        <View style={styles.top}>
          <LinearGradient colors={[colors.brand, colors.shadow]} style={styles.avatar}>
            <Text style={styles.avatarText}>{userEmail.charAt(0)}</Text>
          </LinearGradient>
          <View style={styles.info}>
            <View style={styles.metaRow}>
              <View style={[styles.chip, { backgroundColor: colors.chipBg }]}>
                <Feather name={isAdminRequest ? 'shield' : 'link'} size={12} color={typeColor} />
                <Text style={[styles.chipText, { color: typeColor }]}>{getRoleRequestLabel(notification)}</Text>
              </View>
              <Text style={[styles.timeText, { color: colors.muted }]}>{getTimeAgo(notification.createdAt)}</Text>
            </View>
            <Text style={[styles.email, { color: colors.text }]} numberOfLines={1}>
              {userEmail}
            </Text>
            <Text style={[styles.summary, { color: colors.muted }]}>{getRoleRequestSummary(notification)}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={onReject}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Rechazar solicitud"
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
            accessibilityLabel="Aceptar solicitud"
            accessibilityState={{ disabled }}
            style={[
              styles.button,
              { backgroundColor: colors.brand, borderColor: colors.brand, opacity: buttonOpacity },
            ]}
          >
            <Feather name="check" size={16} color="#fff" />
            <Text style={[styles.buttonText, { color: '#fff' }]}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}
