'use client'

import { useEffect, useState } from 'react'
import { getMyTournamentPlayerRequest, type AppUser } from '@fulbito/firebase'
import LinkPlayerFlow, { linkPlayerStepTitles, type LinkPlayerStep } from '@/components/LinkPlayerFlow'
import Modal from '@/components/Modal'
import { useTournamentLinkPlayerActions } from '@/hooks/use-tournament-link-player-actions'
import { dismissPrompt, linkPlayerPromptKey } from '@/lib/dismissed-prompts'

type Props = {
  user: AppUser
  tournamentId: string
  onClose: () => void
}

export default function LinkPlayerDialog({ user, tournamentId, onClose }: Props) {
  const actions = useTournamentLinkPlayerActions(user, tournamentId)
  const [step, setStep] = useState<LinkPlayerStep | null>(null)

  useEffect(() => {
    let isCurrent = true
    getMyTournamentPlayerRequest(tournamentId, user.uid)
      .then((request) => {
        if (isCurrent) setStep(request?.status === 'pending' ? 'sent' : 'select')
      })
      .catch(() => {
        if (isCurrent) setStep('select')
      })
    return () => {
      isCurrent = false
    }
  }, [tournamentId, user.uid])

  return (
    <Modal
      open
      onClose={onClose}
      title={linkPlayerStepTitles[step ?? 'select']}
      hideHeader={step === 'sent' || step === 'revert'}
    >
      {step ? (
        <LinkPlayerFlow
          step={step}
          onStepChange={setStep}
          onAnswerNo={onClose}
          onRequestSent={() => dismissPrompt(linkPlayerPromptKey(user.uid, tournamentId))}
          onFinish={onClose}
          onCancel={onClose}
          actions={actions}
        />
      ) : (
        <p className="text-sm text-gray-700" role="status">
          Cargando...
        </p>
      )}
    </Modal>
  )
}
