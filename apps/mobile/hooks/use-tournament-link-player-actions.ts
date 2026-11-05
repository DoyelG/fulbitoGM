import { cancelTournamentPlayerRequest, linkOrRequestTournamentPlayer, type AppUser } from '@fulbito/firebase'
import { isTournamentAdminRole } from '@fulbito/utils'
import { useMemo } from 'react'

import type { LinkPlayerActions } from '@/components/players/link-player/link-player-flow'
import { useTournaments } from '@/contexts/TournamentContext'

import { useTournamentMembers } from './use-tournament-members'

export function useTournamentLinkPlayerActions(user: AppUser, tournamentId: string): LinkPlayerActions {
  const members = useTournamentMembers(tournamentId)
  const { reload } = useTournaments()
  const linkedPlayerIds = useMemo(
    () => new Set(members.flatMap((member) => (member.playerId ? [member.playerId] : []))),
    [members],
  )
  const linksDirectly = isTournamentAdminRole(members.find((member) => member.uid === user.uid)?.role)

  return {
    tournamentId,
    send: async (request) => {
      const outcome = await linkOrRequestTournamentPlayer({
        tournamentId,
        uid: user.uid,
        email: user.email,
        ...request,
      })
      if (outcome === 'linked') await reload()
      return outcome
    },
    cancel: () => cancelTournamentPlayerRequest(tournamentId, user.uid),
    isPlayerUnavailable: (player) => linkedPlayerIds.has(player.id),
    linksDirectly,
  }
}
