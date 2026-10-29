'use client'

import { useState } from 'react'
import { FiAlertTriangle, FiCamera, FiCheckCircle, FiFilm, FiLink, FiUser } from 'react-icons/fi'
import { cancelRoleRequest, createRoleRequest, RoleRequestError, type AppUser } from '@fulbito/firebase'
import { usePlayerStore } from '@/store/usePlayerStore'
import Button from './Button'
import LinkPlayerHero from './LinkPlayerHero'
import LinkPlayerStepDots from './LinkPlayerStepDots'
import PlayerSelector from './PlayerSelector'

export type LinkPlayerStep = 'question' | 'select' | 'newPlayer' | 'sent' | 'revert'

const benefits = [
  { icon: FiUser, text: 'Tener tu propio perfil de jugador' },
  { icon: FiFilm, text: 'Subir y borrar tus propios clips' },
  { icon: FiCamera, text: 'Cambiar tu foto, tu nombre y tu posición' },
]

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
  onCancel?: () => void
}

export default function LinkPlayerFlow({
  user,
  step,
  onStepChange,
  onAnswerNo,
  onRequestSent,
  onFinish,
  onCancel,
}: LinkPlayerFlowProps) {
  const players = usePlayerStore((state) => state.players)
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
        <LinkPlayerStepDots current={1} total={3} />
        <LinkPlayerHero
          icon={FiLink}
          title="¿Sos jugador también?"
          description="Si jugás en los partidos, vinculá tu usuario con tu jugador."
        />
        <ul className="mt-6 space-y-2">
          {benefits.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
              <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                <Icon />
              </span>
              {text}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-center gap-3">
          <Button type="button" variant="secondary" block onClick={onAnswerNo}>
            Ahora no
          </Button>
          <Button type="button" block onClick={() => goToStep('select')}>
            Sí, soy jugador
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'select') {
    const selectedPlayerId = [...selectedIds][0]
    return (
      <div>
        <LinkPlayerStepDots current={2} total={3} />
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
          <Button type="button" variant="secondary" onClick={() => (onCancel ? onCancel() : goToStep('question'))}>
            {onCancel ? 'Cancelar' : 'Volver'}
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
        <LinkPlayerStepDots current={2} total={3} />
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
      <div>
        <LinkPlayerHero
          icon={FiAlertTriangle}
          tone="danger"
          title="¿Revertir la solicitud?"
          description="Se va a cancelar y el administrador ya no la va a ver."
        />
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
    <div>
      <LinkPlayerStepDots current={3} total={3} />
      <LinkPlayerHero
        icon={FiCheckCircle}
        tone="success"
        title="Solicitud enviada"
        description="Un administrador la va a revisar. Cuando la acepte, volvé a iniciar sesión para ver el cambio."
      />
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
