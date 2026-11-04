import { cancelTournamentPlayerRequest, createTournamentPlayerRequest, type AppUser } from '@fulbito/firebase'
import { useMemo } from 'react'

import type { LinkPlayerActions } from '@/components/players/link-player/link-player-flow'

import { useTournamentMembers } from './use-tournament-members'

export function useTournamentLinkPlayerActions(user: AppUser, tournamentId: string): LinkPlayerActions {
  const members = useTournamentMembers(tournamentId)
  const linkedPlayerIds = useMemo(
    () => new Set(members.flatMap((member) => (member.playerId ? [member.playerId] : []))),
    [members],
  )

  return {
    tournamentId,
    send: (request) => createTournamentPlayerRequest({ tournamentId, uid: user.uid, email: user.email, ...request }),
    cancel: () => cancelTournamentPlayerRequest(tournamentId, user.uid),
    isPlayerUnavailable: (player) => linkedPlayerIds.has(player.id),
  }
}
