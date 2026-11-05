'use client'

import { useState } from 'react'
import { FiAlertTriangle, FiCamera, FiCheckCircle, FiFilm, FiLink, FiUser } from 'react-icons/fi'
import type { Player } from '@fulbito/types'
import { TournamentPlayerRequestError, type LinkPlayerOutcome } from '@fulbito/firebase'
import { usePlayerStore } from '@/store/usePlayerStore'
import Button from './Button'
import LinkPlayerHero from './LinkPlayerHero'
import LinkPlayerStepDots from './LinkPlayerStepDots'
import PlayerSelector from './PlayerSelector'

export type LinkPlayerStep = 'question' | 'select' | 'newPlayer' | 'sent' | 'linked' | 'revert'

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
  linked: 'Vincular con un jugador',
  revert: 'Vincular con un jugador',
}

export type LinkPlayerRequest = { playerId: string } | { newPlayerName: string }

export type LinkPlayerActions = {
  send: (request: LinkPlayerRequest) => Promise<LinkPlayerOutcome>
  cancel: () => Promise<void>
  isPlayerUnavailable: (player: Player) => boolean
  linksDirectly: boolean
  reviewerDescription: string
}

type LinkPlayerFlowProps = {
  step: LinkPlayerStep
  onStepChange: (step: LinkPlayerStep) => void
  onAnswerNo: () => void
  onRequestSent: () => void
  onFinish: () => void
  onCancel?: () => void
  actions: LinkPlayerActions
}

function isKnownRequestError(error: unknown): error is Error {
  return error instanceof TournamentPlayerRequestError
}

export default function LinkPlayerFlow({
  step,
  onStepChange,
  onAnswerNo,
  onRequestSent,
  onFinish,
  onCancel,
  actions,
}: LinkPlayerFlowProps) {
  const players = usePlayerStore((state) => state.players)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [newPlayerName, setNewPlayerName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const { send, cancel, isPlayerUnavailable, linksDirectly, reviewerDescription } = actions
  const submitLabel = linksDirectly ? 'Vincular' : 'Enviar solicitud'

  const sendRequest = async (request: LinkPlayerRequest) => {
    setIsSending(true)
    setErrorMessage(null)
    try {
      const outcome = await send(request)
      onRequestSent()
      onStepChange(outcome === 'linked' ? 'linked' : 'sent')
    } catch (error) {
      setErrorMessage(
        isKnownRequestError(error) ? error.message : 'No se pudo vincular el jugador. Probá de nuevo más tarde.',
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
        isKnownRequestError(error) ? error.message : 'No se pudo revertir la solicitud. Probá de nuevo más tarde.',
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
    <p role="alert" className="mt-3 text-sm text-orange-700">
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
              <span
                aria-hidden
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
              >
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
          hidePlayerCondition={(player) => !!player.inactive || isPlayerUnavailable(player)}
          maxHeight={240}
        />
        <p className="mt-4 text-sm text-gray-800">
          ¿No encontrás tu nombre?{' '}
          <button
            type="button"
            onClick={() => goToStep('newPlayer')}
            className="rounded font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {linksDirectly ? 'Crear un jugador nuevo' : 'Solicitar un jugador nuevo'}
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
            {submitLabel}
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
            {submitLabel}
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
          description="Se va a cancelar y los organizadores ya no la van a ver."
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

  if (step === 'linked') {
    return (
      <div>
        <LinkPlayerStepDots current={3} total={3} />
        <LinkPlayerHero
          icon={FiCheckCircle}
          tone="success"
          title="Ya estás vinculado"
          description="Ahora podés editar tu jugador desde tu perfil."
        />
        <div className="mt-6 flex justify-center">
          <Button type="button" block onClick={onFinish}>
            Cerrar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <LinkPlayerStepDots current={3} total={3} />
      <LinkPlayerHero icon={FiCheckCircle} tone="success" title="Solicitud enviada" description={reviewerDescription} />
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
