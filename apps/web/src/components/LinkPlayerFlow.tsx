'use client'

import { useState } from 'react'
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { cancelRoleRequest, createRoleRequest, RoleRequestError, type AppUser } from '@fulbito/firebase'
import { usePlayerStore } from '@/store/usePlayerStore'
import Button from './Button'
import PlayerSelector from './PlayerSelector'

export type LinkPlayerStep = 'question' | 'select' | 'newPlayer' | 'sent' | 'revert'

export const linkPlayerStepTitles: Record<LinkPlayerStep, string> = {
  question: '¿Sos jugador también?',
  select: 'Vincular con un jugador',
  newPlayer: 'Vincular con un jugador',
  sent: 'Vincular con un jugador',
  revert: 'Vincular con un jugador',
}

type LinkPlayerFlowProps = {
  user: AppUser
  step: LinkPlayerStep
  onStepChange: (step: LinkPlayerStep) => void
  onAnswerNo: () => void
  onRequestSent: () => void
  onFinish: () => void
}

export default function LinkPlayerFlow({
  user,
  step,
  onStepChange,
  onAnswerNo,
  onRequestSent,
  onFinish,
}: LinkPlayerFlowProps) {
  const { players } = usePlayerStore()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [newPlayerName, setNewPlayerName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sentRequestId, setSentRequestId] = useState<string | null>(null)

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

  const errorAlert = errorMessage && (
    <p role="alert" className="mt-3 text-sm text-red-700">
      {errorMessage}
    </p>
  )

  if (step === 'question') {
    return (
      <div>
        <p className="text-gray-800">Si jugás en los partidos, podés vincular tu usuario con tu jugador.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button type="button" variant="secondary" block onClick={onAnswerNo}>
            No
          </Button>
          <Button type="button" block onClick={() => goToStep('select')}>
            Sí
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'select') {
    const [selectedPlayerId] = selectedIds
    return (
      <div>
        <PlayerSelector
          players={players}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          isMultiSelector={false}
          hidePlayerCondition={(player) => !!player.inactive || !!player.linkedUserId}
          maxHeight={240}
        />
        <p className="mt-4 text-sm text-gray-800">
          ¿No encontrás tu nombre?{' '}
          <button
            type="button"
            onClick={() => goToStep('newPlayer')}
            className="rounded font-medium text-brand hover:underline focus:outline-none focus:ring-2 focus:ring-brand"
          >
            Solicitar un jugador nuevo
          </button>
        </p>
        {errorAlert}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => goToStep('question')}>
            Volver
          </Button>
          <Button
            type="button"
            disabled={!selectedPlayerId || isSending}
            onClick={() => sendRequest({ playerId: selectedPlayerId })}
          >
            Enviar solicitud
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'newPlayer') {
    const trimmedName = newPlayerName.trim()
    return (
      <div>
        <label htmlFor="new-player-name" className="mb-2 block font-medium">
          Escribí el nombre que querés tener
        </label>
        <input
          id="new-player-name"
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="Tu nombre"
        />
        {errorAlert}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => goToStep('select')}>
            Volver
          </Button>
          <Button
            type="button"
            disabled={!trimmedName || isSending}
            onClick={() => sendRequest({ newPlayerName: trimmedName })}
          >
            Enviar solicitud
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'revert') {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <FiAlertTriangle className="text-red-600" size={36} aria-hidden />
        </div>
        <p className="text-lg text-gray-900">
          ¿Seguro que querés revertir la solicitud? Se va a cancelar y el administrador ya no la va a ver.
        </p>
        {errorAlert}
        <div className="mt-6 flex justify-center gap-3">
          <Button type="button" variant="secondary" block onClick={() => goToStep('sent')}>
            Volver
          </Button>
          <Button type="button" variant="danger" block disabled={isSending} onClick={revertRequest}>
            Sí, revertir
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <FiCheckCircle className="text-green-600" size={36} aria-hidden />
      </div>
      <p className="text-lg text-gray-900">Solicitud enviada. Un administrador la va a revisar.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button type="button" variant="dangerousSecondary" block onClick={() => goToStep('revert')}>
          Revertir solicitud
        </Button>
        <Button type="button" block onClick={onFinish}>
          Cerrar
        </Button>
      </div>
    </div>
  )
}
