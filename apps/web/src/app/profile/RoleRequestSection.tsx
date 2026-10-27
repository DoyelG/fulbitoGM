'use client'

import { useCallback, useEffect, useState } from 'react'
import { FiShield } from 'react-icons/fi'
import {
  cancelRoleRequest,
  createRoleRequest,
  getMyRoleRequests,
  RoleRequestError,
  type AppUser,
} from '@fulbito/firebase'
import type { RoleRequest, RoleRequestType } from '@fulbito/types'
import LinkPlayerFlow, { linkPlayerStepTitles, type LinkPlayerStep } from '@/components/LinkPlayerFlow'
import Modal from '@/components/Modal'
import { dismissPrompt } from '@/lib/dismissedPrompts'
import { usePlayerStore } from '@/store/usePlayerStore'
import ProfileSection from './ProfileSection'
import RoleRequestRow from './RoleRequestRow'

type RoleRequestSectionProps = {
  user: AppUser
  isAdmin: boolean
  index: number
}

export default function RoleRequestSection({ user, isAdmin, index }: RoleRequestSectionProps) {
  const players = usePlayerStore((state) => state.players)
  const [requests, setRequests] = useState<RoleRequest[]>([])
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkStep, setLinkStep] = useState<LinkPlayerStep>('select')

  const loadRequests = useCallback(async () => {
    setRequests(await getMyRoleRequests(user.uid))
  }, [user.uid])

  useEffect(() => {
    loadRequests().catch(() => setRequests([]))
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

  const cancelRequest = (request: RoleRequest | null) => run(() => cancelRoleRequest(request!.id))

  const requestAdmin = () =>
    run(() => createRoleRequest({ userId: user.uid, userEmail: user.email, requestedRole: 'ADMIN' }))

  const closeLinkModal = () => {
    setIsLinkModalOpen(false)
    setLinkStep('select')
    void loadRequests()
  }

  const handleLinkRequestSent = () => {
    dismissPrompt(`linkPlayerPromptDismissed:${user.uid}`)
    dismissPrompt(`linkPlayerAlertDismissed:${user.uid}`)
  }

  const adminRequest = findRequest('ADMIN')
  const playerRequest = findRequest('PLAYER')
  const requestedPlayerName =
    playerRequest?.newPlayerName ?? players.find((player) => player.id === playerRequest?.playerId)?.name
  const isLinked = Boolean(user.linkedPlayerId)

  if (isAdmin && isLinked) return null

  return (
    <ProfileSection icon={FiShield} title="Solicitudes" index={index}>
      <div className="space-y-6">
        {!isLinked && (
          <RoleRequestRow
            title="Vincular con un jugador"
            description="Conectá tu usuario con tu jugador para editar tu foto, nombre y posición."
            request={playerRequest}
            detail={requestedPlayerName && `Jugador: ${requestedPlayerName}`}
            isSending={isSending}
            onRequest={() => setIsLinkModalOpen(true)}
            onCancel={() => cancelRequest(playerRequest)}
          />
        )}
        {!isAdmin && (
          <RoleRequestRow
            title="Rol de administrador"
            description="Podés gestionar jugadores, partidos y solicitudes."
            request={adminRequest}
            isSending={isSending}
            onRequest={requestAdmin}
            onCancel={() => cancelRequest(adminRequest)}
          />
        )}
      </div>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      <Modal
        open={isLinkModalOpen}
        onClose={closeLinkModal}
        title={linkPlayerStepTitles[linkStep]}
        hideHeader={linkStep === 'sent' || linkStep === 'revert'}
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
      </Modal>
    </ProfileSection>
  )
}
