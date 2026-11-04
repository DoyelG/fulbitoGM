import { getMyTournamentPlayerRequest, getPlayers, getTournamentMembers, type AppUser } from '@fulbito/firebase'
import { hasLinkablePlayers } from '@fulbito/utils'
import { useEffect, useState } from 'react'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournaments } from '@/contexts/TournamentContext'
import { useTournamentLinkPlayerActions } from '@/hooks/use-tournament-link-player-actions'
import { dismissPrompt, isPromptDismissed, linkPlayerPromptKey } from '@/lib/dismissed-prompts'

import LinkPlayerFlow, { linkPlayerStepTitles, type LinkPlayerStep } from './link-player-flow'

export default function LinkPlayerModal() {
  const { user } = useFirebaseAuth()
  const { activeTournament } = useTournaments()
  if (!user || !activeTournament || activeTournament.membership.playerId) return null
  const tournamentId = activeTournament.tournament.id
  return <LinkPlayerModalContent key={`${user.uid}:${tournamentId}`} user={user} tournamentId={tournamentId} />
}

function LinkPlayerModalContent({ user, tournamentId }: { user: AppUser; tournamentId: string }) {
  const storageKey = linkPlayerPromptKey(user.uid, tournamentId)
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<LinkPlayerStep>('question')
  const actions = useTournamentLinkPlayerActions(user, tournamentId)

  useEffect(() => {
    let isCurrent = true
    void (async () => {
      if (await isPromptDismissed(storageKey)) return
      const [request, players, members] = await Promise.all([
        getMyTournamentPlayerRequest(tournamentId, user.uid),
        getPlayers(tournamentId),
        getTournamentMembers(tournamentId),
      ])
      if (isCurrent && request?.status !== 'pending' && hasLinkablePlayers(players, members)) setIsOpen(true)
    })().catch(() => undefined)
    return () => {
      isCurrent = false
    }
  }, [storageKey, tournamentId, user.uid])

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
        actions={actions}
        step={step}
        onStepChange={setStep}
        onAnswerNo={handleAnswerNo}
        onRequestSent={() => void dismissPrompt(storageKey)}
        onFinish={() => setIsOpen(false)}
      />
    </BottomSheet>
  )
}
