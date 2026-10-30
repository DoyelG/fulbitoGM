import { useMemo } from 'react'
import { cancelTournamentPlayerRequest, createTournamentPlayerRequest, type AppUser } from '@fulbito/firebase'
import type { LinkPlayerActions } from '@/components/LinkPlayerFlow'
import { useTournamentMembers } from './use-tournament-members'

export function useTournamentLinkPlayerActions(user: AppUser, tournamentId: string): LinkPlayerActions {
  const members = useTournamentMembers(tournamentId)
  const linkedPlayerIds = useMemo(
    () => new Set(members.flatMap((member) => (member.playerId ? [member.playerId] : []))),
    [members],
  )

  return {
    send: (request) => createTournamentPlayerRequest({ tournamentId, uid: user.uid, email: user.email, ...request }),
    cancel: () => cancelTournamentPlayerRequest(tournamentId, user.uid),
    isPlayerUnavailable: (player) => linkedPlayerIds.has(player.id),
    reviewerDescription: 'Un organizador del torneo la va a revisar.',
  }
}
