'use client'

import { useState } from 'react'
import type { AppUser } from '@fulbito/firebase'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { dismissPrompt, isPromptDismissed } from '@/lib/dismissed-prompts'
import LinkPlayerFlow, { linkPlayerStepTitles, type LinkPlayerStep } from './LinkPlayerFlow'
import Modal from './Modal'

export default function LinkPlayerModal() {
  const { user } = useFirebaseAuth()
  if (!user || user.linkedPlayerId) return null
  return <LinkPlayerModalContent key={user.uid} user={user} />
}

function LinkPlayerModalContent({ user }: { user: AppUser }) {
  const storageKey = `linkPlayerPromptDismissed:${user.uid}`
  const [isOpen, setIsOpen] = useState(() => !isPromptDismissed(storageKey))
  const [step, setStep] = useState<LinkPlayerStep>('question')

  const handleAnswerNo = () => {
    dismissPrompt(storageKey)
    setIsOpen(false)
  }

  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      title={linkPlayerStepTitles[step]}
      hideHeader={step === 'question' || step === 'sent' || step === 'revert'}
    >
      <LinkPlayerFlow
        user={user}
        step={step}
        onStepChange={setStep}
        onAnswerNo={handleAnswerNo}
        onRequestSent={() => dismissPrompt(storageKey)}
        onFinish={() => setIsOpen(false)}
      />
    </Modal>
  )
}
