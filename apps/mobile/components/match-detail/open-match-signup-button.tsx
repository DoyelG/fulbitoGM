import { getOpenMatchAction, openMatchLockMessage } from '@fulbito/utils'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { ContrastColors } from '@/constants/theme'
import type { OpenMatchController } from '@/hooks/use-open-match'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './open-match-signup-button.styles'

type Props = {
  controller: OpenMatchController
  tone: 'dark' | 'light'
  showHint?: boolean
}

export function OpenMatchSignupButton({ controller, tone, showHint = true }: Props) {
  const router = useRouter()
  const { colors } = useAppTheme()
  const { state, myPlayerId, pending, error, join, leave } = controller
  if (!state) return null

  const hintColor = { color: tone === 'dark' ? ContrastColors.onColorMuted : colors.muted }

  if (!myPlayerId) {
    return (
      <View style={styles.wrap}>
        <Pressable
          onPress={() => router.navigate('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel="Vinculá tu jugador"
          accessibilityHint="Para inscribirte tenés que tener un jugador vinculado en este torneo"
          style={({ pressed }) => [styles.button, tone === 'dark' ? styles.joinDark : null, pressed && styles.pressed]}
        >
          {tone === 'light' && <PrimaryGradient />}
          <Text style={tone === 'dark' ? styles.textJoinDark : styles.textOnColor}>Vinculá tu jugador</Text>
        </Pressable>
      </View>
    )
  }

  const action = getOpenMatchAction(state)
  const message = error ?? openMatchLockMessage(state.lockReason)
  const disabled = !action.enabled || pending
  const isJoin = action.kind === 'join'
  const buttonStyle = isJoin
    ? tone === 'dark'
      ? styles.joinDark
      : null
    : tone === 'dark'
      ? styles.leaveDark
      : styles.leaveLight
  const textStyle = isJoin
    ? tone === 'dark'
      ? styles.textJoinDark
      : styles.textOnColor
    : tone === 'dark'
      ? styles.textOnColor
      : styles.textLeaveLight

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => void (isJoin ? join() : leave())}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={action.label}
        accessibilityHint={message ?? undefined}
        accessibilityState={{ disabled, busy: pending }}
        style={({ pressed }) => [styles.button, buttonStyle, disabled && styles.disabled, pressed && styles.pressed]}
      >
        {isJoin && tone === 'light' && <PrimaryGradient />}
        <Text style={textStyle}>{pending ? 'Guardando…' : action.label}</Text>
      </Pressable>
      {showHint && message ? (
        <Text style={[styles.hint, hintColor]} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
    </View>
  )
}
