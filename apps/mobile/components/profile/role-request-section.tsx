import {
  cancelRoleRequest,
  createRoleRequest,
  getMyRoleRequests,
  getPlayers,
  RoleRequestError,
  type AppUser,
} from '@fulbito/firebase'
import type { Player, RoleRequest, RoleRequestType } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import LinkPlayerFlow, {
  linkPlayerStepTitles,
  type LinkPlayerStep,
} from '@/components/players/link-player/link-player-flow'
import { dismissPrompt } from '@/lib/dismissed-prompts'
import { useAppTheme } from '@/hooks/use-theme'

import { formStyles } from './profile-form.styles'
import { ProfileSection } from './profile-section'
import { RoleRequestRow } from './role-request-row'

type Props = {
  user: AppUser
  isAdmin: boolean
  index: number
}

export function RoleRequestSection({ user, isAdmin, index }: Props) {
  const { colors } = useAppTheme()
  const [requests, setRequests] = useState<RoleRequest[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [isSending, setIsSending] = useState(false)
  const [areRequestsLoaded, setAreRequestsLoaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkStep, setLinkStep] = useState<LinkPlayerStep>('select')

  const loadRequests = useCallback(async () => {
    try {
      setRequests(await getMyRoleRequests(user.uid))
      setAreRequestsLoaded(true)
    } catch {
      setErrorMessage('No se pudieron cargar tus solicitudes. Probá de nuevo más tarde.')
    }
  }, [user.uid])

  useEffect(() => {
    void loadRequests()
    getPlayers()
      .then(setPlayers)
      .catch(() => setPlayers([]))
  }, [loadRequests])

  const findRequest = (role: RoleRequestType) => requests.find((request) => request.requestedRole === role) ?? null

  const run = async (action: () => Promise<unknown>) => {
    setIsSending(true)
    setErrorMessage(null)
    try {
      await action()
      await loadRequests()
    } catch (error) {
      setErrorMessage(
        error instanceof RoleRequestError ? error.message : 'No se pudo completar la acción. Probá de nuevo más tarde.',
      )
    } finally {
      setIsSending(false)
    }
  }

  const cancelRequest = (request: RoleRequest | null) => {
    if (request) void run(() => cancelRoleRequest(request.id))
  }

  const requestAdmin = () =>
    void run(() => createRoleRequest({ userId: user.uid, userEmail: user.email, requestedRole: 'ADMIN' }))

  const closeLinkModal = () => {
    setIsLinkModalOpen(false)
    setLinkStep('select')
    void loadRequests()
  }

  const handleLinkRequestSent = () => {
    void dismissPrompt(`linkPlayerPromptDismissed:${user.uid}`)
    void dismissPrompt(`linkPlayerAlertDismissed:${user.uid}`)
  }

  const adminRequest = findRequest('ADMIN')
  const playerRequest = findRequest('PLAYER')
  const requestedPlayerName =
    playerRequest?.newPlayerName ?? players.find((player) => player.id === playerRequest?.playerId)?.name
  const isLinked = Boolean(user.linkedPlayerId)

  if (isAdmin && isLinked) return null

  return (
    <ProfileSection icon="shield" title="Solicitudes" index={index}>
      <View style={formStyles.form}>
        {!isLinked && (
          <RoleRequestRow
            title="Vincular con un jugador"
            description="Conectá tu usuario con tu jugador para editar tu foto, nombre y posición."
            request={playerRequest}
            detail={requestedPlayerName ? `Jugador: ${requestedPlayerName}` : undefined}
            isSending={isSending || !areRequestsLoaded}
            onRequest={() => setIsLinkModalOpen(true)}
            onCancel={() => cancelRequest(playerRequest)}
          />
        )}
        {!isAdmin && (
          <RoleRequestRow
            title="Rol de administrador"
            description="Podés gestionar jugadores, partidos y solicitudes."
            request={adminRequest}
            isSending={isSending || !areRequestsLoaded}
            onRequest={requestAdmin}
            onCancel={() => cancelRequest(adminRequest)}
          />
        )}
        {errorMessage && (
          <Text style={[formStyles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
            {errorMessage}
          </Text>
        )}
      </View>
      <BottomSheet
        visible={isLinkModalOpen}
        title={linkPlayerStepTitles[linkStep]}
        hideTitle={linkStep === 'sent' || linkStep === 'revert'}
        closeLabel="Cerrar"
        onConfirm={closeLinkModal}
      >
        <LinkPlayerFlow
          user={user}
          step={linkStep}
          onStepChange={setLinkStep}
          onAnswerNo={closeLinkModal}
          onRequestSent={handleLinkRequestSent}
          onFinish={closeLinkModal}
          onCancel={closeLinkModal}
        />
      </BottomSheet>
    </ProfileSection>
  )
}
