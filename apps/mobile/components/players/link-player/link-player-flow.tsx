import Feather from '@expo/vector-icons/Feather'
import { getPlayers, TournamentPlayerRequestError, type LinkPlayerOutcome } from '@fulbito/firebase'
import type { Player } from '@fulbito/types'
import { useEffect, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

import PlayerSelector from '@/components/players/player-selector/player-selector'
import { PrimaryGradient } from '@/components/primary-gradient'
import { PrimaryColors } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'

import LinkPlayerHero from './link-player-hero'
import LinkPlayerStepDots from './link-player-step-dots'
import { styles } from './link-player-flow.styles'

export type LinkPlayerStep = 'question' | 'select' | 'newPlayer' | 'sent' | 'linked' | 'revert'

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
  linked: 'Vincular con un jugador',
  revert: 'Vincular con un jugador',
}

export type LinkPlayerRequest = { playerId: string } | { newPlayerName: string }

export type LinkPlayerActions = {
  tournamentId: string
  send: (request: LinkPlayerRequest) => Promise<LinkPlayerOutcome>
  cancel: () => Promise<void>
  isPlayerUnavailable: (player: Player) => boolean
  linksDirectly: boolean
}

type Props = {
  actions: LinkPlayerActions
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
    primary: { background: 'transparent', text: PrimaryColors.onPrimary, border: PrimaryColors.border },
    secondary: { background: colors.primarySoft, text: colors.primaryText, border: colors.primarySoft },
    danger: { background: colors.danger, text: colors.onPrimary, border: colors.danger },
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
      {variant === 'primary' && <PrimaryGradient />}
      <Text style={[styles.buttonText, { color: text }]}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function LinkPlayerFlow({
  actions,
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
  const { tournamentId, send, cancel, isPlayerUnavailable, linksDirectly } = actions
  const submitLabel = linksDirectly ? 'Vincular' : 'Enviar solicitud'
  const newPlayerLabel = linksDirectly ? 'Crear un jugador nuevo' : 'Solicitar un jugador nuevo'

  useEffect(() => {
    void getPlayers(tournamentId)
      .then(setPlayers)
      .catch(() => setErrorMessage('No se pudieron cargar los jugadores'))
  }, [tournamentId])

  const sendRequest = async (request: LinkPlayerRequest) => {
    setIsSending(true)
    setErrorMessage(null)
    try {
      const outcome = await send(request)
      onRequestSent()
      onStepChange(outcome === 'linked' ? 'linked' : 'sent')
    } catch (error) {
      setErrorMessage(
        error instanceof TournamentPlayerRequestError
          ? error.message
          : 'No se pudo vincular el jugador. Probá de nuevo más tarde.',
      )
    } finally {
      setIsSending(false)
    }
  }

  const revertRequest = async () => {
    setIsSending(true)
    setErrorMessage(null)
    try {
      await cancel()
      onStepChange('select')
    } catch (error) {
      setErrorMessage(
        error instanceof TournamentPlayerRequestError
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
              <View style={[styles.benefitIcon, { backgroundColor: colors.primarySoft }]}>
                <Feather name={icon} size={16} color={colors.primaryText} accessible={false} />
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
    const selectedPlayerId = [...selectedIds][0]
    return (
      <View style={styles.container}>
        <LinkPlayerStepDots current={2} total={3} />
        <PlayerSelector
          players={players}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          isMultiSelector={false}
          hidePlayerCondition={(player) => !!player.inactive || isPlayerUnavailable(player)}
          maxHeight={240}
        />
        <Text style={[styles.text, { color: colors.muted }]}>
          ¿No encontrás tu nombre?{' '}
          <Text
            onPress={() => goToStep('newPlayer')}
            accessibilityRole="link"
            accessibilityLabel={newPlayerLabel}
            style={[styles.link, { color: colors.primaryText }]}
          >
            {newPlayerLabel}
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
            label={submitLabel}
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
            label={submitLabel}
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
          description="Se va a cancelar y los organizadores ya no la van a ver."
        />
        {errorText}
        <View style={styles.row}>
          <FlowButton label="Volver" onPress={() => goToStep('sent')} variant="secondary" />
          <FlowButton label="Sí, revertir" onPress={() => void revertRequest()} variant="danger" disabled={isSending} />
        </View>
      </View>
    )
  }

  if (step === 'linked') {
    return (
      <View style={styles.container}>
        <LinkPlayerStepDots current={3} total={3} />
        <LinkPlayerHero
          icon="check-circle"
          title="Ya estás vinculado"
          description="Ahora podés editar tu jugador desde tu perfil."
        />
        <View style={styles.row}>
          <FlowButton label="Cerrar" onPress={onFinish} />
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
        description="Un organizador del torneo la va a revisar."
      />
      <View style={styles.row}>
        <FlowButton label="Revertir solicitud" onPress={() => goToStep('revert')} variant="dangerousSecondary" />
        <FlowButton label="Cerrar" onPress={onFinish} />
      </View>
    </View>
  )
}
