import Feather from '@expo/vector-icons/Feather'
import { cancelRoleRequest, createRoleRequest, getPlayers, RoleRequestError, type AppUser } from '@fulbito/firebase'
import type { Player } from '@fulbito/types'
import { useEffect, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

import PlayerSelector from '@/components/players/player-selector/player-selector'
import { useAppTheme } from '@/hooks/use-theme'

import LinkPlayerHero from './link-player-hero'
import LinkPlayerStepDots from './link-player-step-dots'
import { styles } from './link-player-flow.styles'

export type LinkPlayerStep = 'question' | 'select' | 'newPlayer' | 'sent' | 'revert'

const benefits: { icon: keyof typeof Feather.glyphMap; text: string }[] = [
  { icon: 'user', text: 'Tener tu propio perfil de jugador' },
  { icon: 'film', text: 'Subir y borrar tus propios clips' },
  { icon: 'camera', text: 'Cambiar tu foto, tu nombre y tu posición' },
]

export const linkPlayerStepTitles: Record<LinkPlayerStep, string> = {
  question: '¿Sos jugador también?',
  select: 'Vincular con un jugador',
  newPlayer: 'Vincular con un jugador',
  sent: 'Vincular con un jugador',
  revert: 'Vincular con un jugador',
}

type Props = {
  user: AppUser
  step: LinkPlayerStep
  onStepChange: (step: LinkPlayerStep) => void
  onAnswerNo: () => void
  onRequestSent: () => void
  onFinish: () => void
  onCancel?: () => void
}

type FlowButtonVariant = 'primary' | 'secondary' | 'danger' | 'dangerousSecondary'

type FlowButtonProps = {
  label: string
  onPress: () => void
  variant?: FlowButtonVariant
  disabled?: boolean
}

function FlowButton({ label, onPress, variant = 'primary', disabled = false }: FlowButtonProps) {
  const { colors } = useAppTheme()
  const buttonColors: Record<FlowButtonVariant, { background: string; text: string; border: string }> = {
    primary: { background: colors.brand, text: '#fff', border: colors.brand },
    secondary: { background: colors.brandSoft, text: colors.brand, border: colors.brandSoft },
    danger: { background: colors.danger, text: '#fff', border: colors.danger },
    dangerousSecondary: { background: colors.surface, text: colors.danger, border: colors.danger },
  }
  const { background, text, border } = buttonColors[variant]

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.button, { backgroundColor: background, borderColor: border, opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={[styles.buttonText, { color: text }]}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function LinkPlayerFlow({
  user,
  step,
  onStepChange,
  onAnswerNo,
  onRequestSent,
  onFinish,
  onCancel,
}: Props) {
  const { colors, radii } = useAppTheme()
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [newPlayerName, setNewPlayerName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sentRequestId, setSentRequestId] = useState<string | null>(null)

  useEffect(() => {
    void getPlayers()
      .then(setPlayers)
      .catch(() => setErrorMessage('No se pudieron cargar los jugadores'))
  }, [])

  const sendRequest = async (request: { playerId: string } | { newPlayerName: string }) => {
    setIsSending(true)
    setErrorMessage(null)
    try {
      const requestId = await createRoleRequest({
        userId: user.uid,
        userEmail: user.email,
        requestedRole: 'PLAYER',
        ...request,
      })
      setSentRequestId(requestId)
      onRequestSent()
      onStepChange('sent')
    } catch (error) {
      setErrorMessage(
        error instanceof RoleRequestError ? error.message : 'No se pudo enviar la solicitud. Probá de nuevo más tarde.',
      )
    } finally {
      setIsSending(false)
    }
  }

  const revertRequest = async () => {
    if (!sentRequestId) return
    setIsSending(true)
    setErrorMessage(null)
    try {
      await cancelRoleRequest(sentRequestId)
      onStepChange('select')
    } catch (error) {
      setErrorMessage(
        error instanceof RoleRequestError
          ? error.message
          : 'No se pudo revertir la solicitud. Probá de nuevo más tarde.',
      )
    } finally {
      setIsSending(false)
    }
  }

  const goToStep = (nextStep: LinkPlayerStep) => {
    setErrorMessage(null)
    onStepChange(nextStep)
  }

  const errorText = errorMessage && (
    <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
      {errorMessage}
    </Text>
  )

  if (step === 'question') {
    return (
      <View style={styles.container}>
        <LinkPlayerStepDots current={1} total={3} />
        <LinkPlayerHero
          icon="link"
          title="¿Sos jugador también?"
          description="Si jugás en los partidos, vinculá tu usuario con tu jugador."
        />
        <View style={styles.benefits}>
          {benefits.map(({ icon, text }) => (
            <View key={text} style={[styles.benefit, { backgroundColor: colors.chipBg, borderRadius: radii.md }]}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.brandSoft }]}>
                <Feather name={icon} size={16} color={colors.brand} accessible={false} />
              </View>
              <Text style={[styles.benefitText, { color: colors.text }]}>{text}</Text>
            </View>
          ))}
        </View>
        <View style={styles.row}>
          <FlowButton label="Ahora no" onPress={onAnswerNo} variant="secondary" />
          <FlowButton label="Sí, soy jugador" onPress={() => goToStep('select')} />
        </View>
      </View>
    )
  }

  if (step === 'select') {
    const [selectedPlayerId] = selectedIds
    return (
      <View style={styles.container}>
        <LinkPlayerStepDots current={2} total={3} />
        <PlayerSelector
          players={players}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          isMultiSelector={false}
          hidePlayerCondition={(player) => !!player.inactive || !!player.linkedUserId}
          maxHeight={240}
        />
        <Text style={[styles.text, { color: colors.muted }]}>
          ¿No encontrás tu nombre?{' '}
          <Text
            onPress={() => goToStep('newPlayer')}
            accessibilityRole="link"
            style={[styles.link, { color: colors.brand }]}
          >
            Solicitar un jugador nuevo
          </Text>
        </Text>
        {errorText}
        <View style={styles.row}>
          <FlowButton
            label={onCancel ? 'Cancelar' : 'Volver'}
            onPress={() => (onCancel ? onCancel() : goToStep('question'))}
            variant="secondary"
          />
          <FlowButton
            label="Enviar solicitud"
            onPress={() => void sendRequest({ playerId: selectedPlayerId })}
            disabled={!selectedPlayerId || isSending}
          />
        </View>
      </View>
    )
  }

  if (step === 'newPlayer') {
    const trimmedName = newPlayerName.trim()
    return (
      <View style={styles.container}>
        <LinkPlayerStepDots current={2} total={3} />
        <Text style={[styles.label, { color: colors.text }]}>Escribí el nombre que querés tener</Text>
        <TextInput
          value={newPlayerName}
          onChangeText={setNewPlayerName}
          placeholder="Tu nombre"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Nombre del jugador nuevo"
          style={[styles.input, { color: colors.text, borderColor: colors.border, borderRadius: radii.sm }]}
        />
        {errorText}
        <View style={styles.row}>
          <FlowButton label="Volver" onPress={() => goToStep('select')} variant="secondary" />
          <FlowButton
            label="Enviar solicitud"
            onPress={() => void sendRequest({ newPlayerName: trimmedName })}
            disabled={!trimmedName || isSending}
          />
        </View>
      </View>
    )
  }

  if (step === 'revert') {
    return (
      <View style={styles.container}>
        <LinkPlayerHero
          icon="alert-triangle"
          tone="danger"
          title="¿Revertir la solicitud?"
          description="Se va a cancelar y el administrador ya no la va a ver."
        />
        {errorText}
        <View style={styles.row}>
          <FlowButton label="Volver" onPress={() => goToStep('sent')} variant="secondary" />
          <FlowButton label="Sí, revertir" onPress={() => void revertRequest()} variant="danger" disabled={isSending} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LinkPlayerStepDots current={3} total={3} />
      <LinkPlayerHero
        icon="check-circle"
        title="Solicitud enviada"
        description="Un administrador la va a revisar. Cuando la acepte, volvé a iniciar sesión para ver el cambio."
      />
      <View style={styles.row}>
        <FlowButton label="Revertir solicitud" onPress={() => goToStep('revert')} variant="dangerousSecondary" />
        <FlowButton label="Cerrar" onPress={onFinish} />
      </View>
    </View>
  )
}
