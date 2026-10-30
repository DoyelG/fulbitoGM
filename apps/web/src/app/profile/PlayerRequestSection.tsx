'use client'

import { useCallback, useEffect, useState } from 'react'
import { FiLink } from 'react-icons/fi'
import {
  cancelTournamentPlayerRequest,
  getMyTournamentPlayerRequest,
  TournamentPlayerRequestError,
  type AppUser,
} from '@fulbito/firebase'
import type { TournamentPlayerRequest } from '@fulbito/types'
import LinkPlayerFlow, { linkPlayerStepTitles, type LinkPlayerStep } from '@/components/LinkPlayerFlow'
import Modal from '@/components/Modal'
import { useTournamentLinkPlayerActions } from '@/hooks/use-tournament-link-player-actions'
import { dismissPrompt, linkPlayerPromptKey } from '@/lib/dismissed-prompts'
import { usePlayerStore } from '@/store/usePlayerStore'
import ProfileSection from './ProfileSection'
import RequestRow from './RequestRow'

type PlayerRequestSectionProps = {
  user: AppUser
  tournamentId: string
  tournamentName: string
  index: number
}

export default function PlayerRequestSection({ user, tournamentId, tournamentName, index }: PlayerRequestSectionProps) {
  const players = usePlayerStore((state) => state.players)
  const actions = useTournamentLinkPlayerActions(user, tournamentId)
  const [request, setRequest] = useState<TournamentPlayerRequest | null>(null)
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
  }, [loadRequest])

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
    <ProfileSection icon={FiLink} title="Tu jugador" index={index}>
      <RequestRow
        title={`Vincular con un jugador de ${tournamentName}`}
        description="Conectá tu usuario con tu jugador para editar tu foto, nombre y posición."
        status={request?.status}
        detail={requestedPlayerName && `Jugador: ${requestedPlayerName}`}
        isSending={isSending || !isLoaded}
        onRequest={() => setIsModalOpen(true)}
        onCancel={cancelRequest}
      />
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={linkPlayerStepTitles[step]}
        hideHeader={step === 'sent' || step === 'revert'}
      >
        <LinkPlayerFlow
          step={step}
          onStepChange={setStep}
          onAnswerNo={closeModal}
          onRequestSent={() => dismissPrompt(linkPlayerPromptKey(user.uid, tournamentId))}
          onFinish={closeModal}
          onCancel={closeModal}
          actions={actions}
        />
      </Modal>
    </ProfileSection>
  )
}
