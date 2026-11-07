'use client'

import { useEffect, useState } from 'react'
import { getMyTournamentPlayerRequest, getPlayers, getTournamentMembers, type AppUser } from '@fulbito/firebase'
import { hasLinkablePlayers } from '@fulbito/utils'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournamentLinkPlayerActions } from '@/hooks/use-tournament-link-player-actions'
import { dismissPrompt, isPromptDismissed, linkPlayerPromptKey } from '@/lib/dismissed-prompts'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'
import LinkPlayerFlow, { linkPlayerStepTitles, type LinkPlayerStep } from './LinkPlayerFlow'
import Modal from './Modal'

export default function LinkPlayerModal() {
  const { user } = useFirebaseAuth()
  const activeTournament = useTournamentStore(selectActiveTournament)
  if (!user || !activeTournament) return null
  const tournamentId = activeTournament.tournament.id
  return (
    <LinkPlayerModalContent
      key={`${user.uid}:${tournamentId}`}
      user={user}
      tournamentId={tournamentId}
      isLinked={!!activeTournament.membership.playerId}
    />
  )
}

type LinkPlayerModalContentProps = { user: AppUser; tournamentId: string; isLinked: boolean }

function LinkPlayerModalContent({ user, tournamentId, isLinked }: LinkPlayerModalContentProps) {
  const storageKey = linkPlayerPromptKey(user.uid, tournamentId)
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<LinkPlayerStep>('question')
  const actions = useTournamentLinkPlayerActions(user, tournamentId)

  useEffect(() => {
    if (isLinked || isPromptDismissed(storageKey)) return
    let isCurrent = true
    Promise.all([
      getMyTournamentPlayerRequest(tournamentId, user.uid),
      getPlayers(tournamentId),
      getTournamentMembers(tournamentId),
    ])
      .then(([request, players, members]) => {
        if (isCurrent && request?.status !== 'pending' && hasLinkablePlayers(players, members)) setIsOpen(true)
      })
      .catch(() => undefined)
    return () => {
      isCurrent = false
    }
  }, [isLinked, storageKey, tournamentId, user.uid])

  const handleAnswerNo = () => {
    dismissPrompt(storageKey)
    setIsOpen(false)
  }

  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      title={linkPlayerStepTitles[step]}
      size={step === 'select' ? 'medium' : 'default'}
      hideHeader={step === 'question' || step === 'sent' || step === 'linked' || step === 'revert'}
    >
      <LinkPlayerFlow
        step={step}
        onStepChange={setStep}
        onAnswerNo={handleAnswerNo}
        onRequestSent={() => dismissPrompt(storageKey)}
        onFinish={() => setIsOpen(false)}
        actions={actions}
      />
    </Modal>
  )
}
