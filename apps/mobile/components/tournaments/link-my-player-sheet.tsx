import { getMyTournamentPlayerRequest, getPlayers, getTournamentMembers, type AppUser } from '@fulbito/firebase'
import type { MyTournament, Player } from '@fulbito/types'
import { getAssignablePlayers } from '@fulbito/utils'
import { useEffect, useState } from 'react'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import LinkPlayerFlow, {
  linkPlayerStepTitles,
  type LinkPlayerStep,
} from '@/components/players/link-player/link-player-flow'
import { useTournaments } from '@/contexts/TournamentContext'
import { useTournamentLinkPlayerActions } from '@/hooks/use-tournament-link-player-actions'
import { dismissPrompt, linkPlayerPromptKey } from '@/lib/dismissed-prompts'

import { AssignPlayerSheet } from './assign-player-sheet'

type Props = {
  user: AppUser
  item: MyTournament
  onClose: () => void
}

function RequestPlayerSheet({ user, item, onClose }: Props) {
  const tournamentId = item.tournament.id
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

  if (!step) return null

  return (
    <BottomSheet
      visible
      title={linkPlayerStepTitles[step]}
      hideTitle={step === 'sent' || step === 'revert'}
      closeLabel="Cerrar"
      onConfirm={onClose}
    >
      <LinkPlayerFlow
        actions={actions}
        step={step}
        onStepChange={setStep}
        onAnswerNo={onClose}
        onRequestSent={() => void dismissPrompt(linkPlayerPromptKey(user.uid, tournamentId))}
        onFinish={onClose}
        onCancel={onClose}
      />
    </BottomSheet>
  )
}

function SelfAssignSheet({ item, onClose }: Omit<Props, 'user'>) {
  const { assignMyPlayer } = useTournaments()
  const tournamentId = item.tournament.id
  const [players, setPlayers] = useState<Player[] | null>(null)

  useEffect(() => {
    let isCurrent = true
    Promise.all([getPlayers(tournamentId), getTournamentMembers(tournamentId)])
      .then(([tournamentPlayers, members]) => {
        if (isCurrent) setPlayers(getAssignablePlayers(tournamentPlayers, members, item.membership))
      })
      .catch(() => {
        if (isCurrent) setPlayers([])
      })
    return () => {
      isCurrent = false
    }
  }, [tournamentId, item.membership])

  const handleSubmit = async (playerId: string | null) => {
    await assignMyPlayer(tournamentId, playerId)
    onClose()
  }

  return (
    <AssignPlayerSheet
      title="Elegir mi jugador"
      description="Elegí tu jugador en este torneo."
      players={players ?? []}
      currentPlayerId={item.membership.playerId}
      isLoading={players === null}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  )
}

export function LinkMyPlayerSheet({ user, item, onClose }: Props) {
  if (item.membership.role === 'MEMBER') return <RequestPlayerSheet user={user} item={item} onClose={onClose} />
  return <SelfAssignSheet item={item} onClose={onClose} />
}
