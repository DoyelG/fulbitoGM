import { getOpenMatchAction } from '@fulbito/utils'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { useMatchById, useOpenMatch } from '@/hooks/use-open-match'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './open-match-comment-actions.styles'

type Props = {
  matchId: string
}

const SIGNED_UP_LABEL = {
  confirmed: 'Ya estás anotado',
  waitlist: 'Estás en la lista de espera',
} as const

const noop = async () => undefined

export function OpenMatchCommentActions({ matchId }: Props) {
  const { colors } = useAppTheme()
  const router = useRouter()
  const { state, myPlayerId, pending, error, join } = useOpenMatch(useMatchById(matchId), noop)
  const openMatch = () => router.push({ pathname: '/(tabs)/history/[id]', params: { id: matchId } })

  const renderJoin = () => {
    if (!state) return null
    if (state.myPosition) {
      return (
        <Text style={[styles.status, { color: colors.primaryText }]} accessibilityLiveRegion="polite">
          {SIGNED_UP_LABEL[state.myPosition]}
        </Text>
      )
    }
    const action = getOpenMatchAction(state)
    const label = action.label === 'Inscribirme' ? 'Unirse' : action.label
    const disabled = myPlayerId !== null && (!action.enabled || pending)
    return (
      <Pressable
        onPress={myPlayerId ? () => void join() : openMatch}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={myPlayerId ? undefined : 'Abre el partido para vincular tu jugador'}
        accessibilityState={{ disabled, busy: pending }}
        style={[styles.button, disabled && styles.disabled]}
      >
        <PrimaryGradient />
        <Text style={styles.joinText}>{pending ? 'Guardando…' : label}</Text>
      </Pressable>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderJoin()}
        <Pressable
          onPress={openMatch}
          accessibilityRole="button"
          accessibilityLabel="Ver partido"
          style={[styles.button, styles.outlined, { borderColor: colors.primaryRing }]}
        >
          <Text style={[styles.buttonText, { color: colors.primaryText }]}>Ver partido</Text>
        </Pressable>
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  )
}
