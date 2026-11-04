import {
  cancelTournamentPlayerRequest,
  getMyTournamentPlayerRequest,
  getPlayers,
  TournamentPlayerRequestError,
  type AppUser,
} from '@fulbito/firebase'
import type { Player, TournamentPlayerRequest } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import LinkPlayerFlow, {
  linkPlayerStepTitles,
  type LinkPlayerStep,
} from '@/components/players/link-player/link-player-flow'
import { useTournamentLinkPlayerActions } from '@/hooks/use-tournament-link-player-actions'
import { useAppTheme } from '@/hooks/use-theme'
import { dismissPrompt, linkPlayerPromptKey } from '@/lib/dismissed-prompts'

import { formStyles } from './profile-form.styles'
import { ProfileSection } from './profile-section'
import { RequestRow } from './request-row'

type Props = {
  user: AppUser
  tournamentId: string
  tournamentName: string
  index: number
}

export function PlayerRequestSection({ user, tournamentId, tournamentName, index }: Props) {
  const { colors } = useAppTheme()
  const actions = useTournamentLinkPlayerActions(user, tournamentId)
  const [request, setRequest] = useState<TournamentPlayerRequest | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [step, setStep] = useState<LinkPlayerStep>('select')

  const loadRequest = useCallback(async () => {
    try {
      setRequest(await getMyTournamentPlayerRequest(tournamentId, user.uid))
      setIsLoaded(true)
    } catch {
      setErrorMessage('No se pudo cargar tu solicitud. Probá de nuevo más tarde.')
    }
  }, [tournamentId, user.uid])

  useEffect(() => {
    void loadRequest()
    getPlayers(tournamentId)
      .then(setPlayers)
      .catch(() => setPlayers([]))
  }, [loadRequest, tournamentId])

  const cancelRequest = async () => {
    setIsSending(true)
    setErrorMessage(null)
    try {
      await cancelTournamentPlayerRequest(tournamentId, user.uid)
      await loadRequest()
    } catch (error) {
      setErrorMessage(
        error instanceof TournamentPlayerRequestError
          ? error.message
          : 'No se pudo cancelar la solicitud. Probá de nuevo más tarde.',
      )
    } finally {
      setIsSending(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setStep('select')
    void loadRequest()
  }

  const requestedPlayerName = request?.newPlayerName ?? players.find((player) => player.id === request?.playerId)?.name

  return (
    <ProfileSection icon="link" title="Tu jugador" index={index}>
      <View style={formStyles.form}>
        <RequestRow
          title={`Vincular con un jugador de ${tournamentName}`}
          description="Conectá tu usuario con tu jugador para editar tu foto, nombre y posición."
          status={request?.status}
          detail={requestedPlayerName ? `Jugador: ${requestedPlayerName}` : undefined}
          isSending={isSending || !isLoaded}
          onRequest={() => setIsModalOpen(true)}
          onCancel={() => void cancelRequest()}
        />
        {errorMessage && (
          <Text style={[formStyles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
            {errorMessage}
          </Text>
        )}
      </View>
      <BottomSheet
        visible={isModalOpen}
        title={linkPlayerStepTitles[step]}
        hideTitle={step === 'sent' || step === 'revert'}
        closeLabel="Cerrar"
        onConfirm={closeModal}
      >
        <LinkPlayerFlow
          actions={actions}
          step={step}
          onStepChange={setStep}
          onAnswerNo={closeModal}
          onRequestSent={() => void dismissPrompt(linkPlayerPromptKey(user.uid, tournamentId))}
          onFinish={closeModal}
          onCancel={closeModal}
        />
      </BottomSheet>
    </ProfileSection>
  )
}
