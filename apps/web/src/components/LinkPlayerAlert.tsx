'use client'

import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import type { AppUser } from '@fulbito/firebase'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { dismissPrompt, isPromptDismissed } from '@/lib/dismissed-prompts'
import LinkPlayerFlow, { linkPlayerStepTitles, type LinkPlayerStep } from './LinkPlayerFlow'
import Modal from './Modal'

export default function LinkPlayerAlert() {
  const { user } = useFirebaseAuth()
  if (!user || user.linkedPlayerId) return null
  return <LinkPlayerAlertContent key={user.uid} user={user} />
}

function LinkPlayerAlertContent({ user }: { user: AppUser }) {
  const alertStorageKey = `linkPlayerAlertDismissed:${user.uid}`
  const modalStorageKey = `linkPlayerPromptDismissed:${user.uid}`
  const [isAlertDismissed, setIsAlertDismissed] = useState(() => isPromptDismissed(alertStorageKey))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [step, setStep] = useState<LinkPlayerStep>('select')

  const dismissAlert = () => {
    dismissPrompt(alertStorageKey)
    setIsAlertDismissed(true)
  }

  const handleRequestSent = () => {
    dismissPrompt(modalStorageKey)
    dismissAlert()
  }

  return (
    <>
      {!isAlertDismissed && (
        <div role="status" className="mb-6 flex items-center justify-between gap-3 rounded-md bg-brand/10 px-4 py-3">
          <p className="text-sm text-gray-800">
            ¿Necesitás vincular tu cuenta con algún jugador?{' '}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded font-medium text-brand hover:underline focus:outline-none focus:ring-2 focus:ring-brand"
            >
              Solicitalo ahora
            </button>
          </p>
          <button
            type="button"
            onClick={dismissAlert}
            aria-label="Cerrar aviso"
            className="rounded p-1 text-gray-600 hover:bg-brand/10 focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <FiX size={18} aria-hidden />
          </button>
        </div>
      )}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={linkPlayerStepTitles[step]}
        hideHeader={step === 'sent' || step === 'revert'}
      >
        <LinkPlayerFlow
          user={user}
          step={step}
          onStepChange={setStep}
          onAnswerNo={() => setIsModalOpen(false)}
          onRequestSent={handleRequestSent}
          onFinish={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  )
}
