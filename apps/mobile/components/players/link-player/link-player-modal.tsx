import { useEffect, useState } from 'react'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { dismissPrompt, isPromptDismissed } from '@/lib/dismissed-prompts'

import LinkPlayerFlow, { linkPlayerStepTitles, type LinkPlayerStep } from './link-player-flow'

export default function LinkPlayerModal() {
  const { user } = useFirebaseAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<LinkPlayerStep>('question')

  const userId = user?.uid
  const isLinked = Boolean(user?.linkedPlayerId)
  const storageKey = `linkPlayerPromptDismissed:${userId}`

  useEffect(() => {
    if (!userId || isLinked) return
    let isCancelled = false
    void isPromptDismissed(storageKey).then((isDismissed) => {
      if (!isCancelled) setIsOpen(!isDismissed)
    })
    return () => {
      isCancelled = true
    }
  }, [userId, isLinked, storageKey])

  if (!user || isLinked) return null

  const handleAnswerNo = () => {
    void dismissPrompt(storageKey)
    setIsOpen(false)
  }

  return (
    <BottomSheet
      visible={isOpen}
      title={linkPlayerStepTitles[step]}
      hideTitle={step === 'question' || step === 'sent' || step === 'revert'}
      closeLabel="Cerrar"
      onConfirm={() => setIsOpen(false)}
    >
      <LinkPlayerFlow
        user={user}
        step={step}
        onStepChange={setStep}
        onAnswerNo={handleAnswerNo}
        onRequestSent={() => void dismissPrompt(storageKey)}
        onFinish={() => setIsOpen(false)}
      />
    </BottomSheet>
  )
}
