import { useMemo } from 'react'
import { cancelTournamentPlayerRequest, linkOrRequestTournamentPlayer, type AppUser } from '@fulbito/firebase'
import { isTournamentAdminRole } from '@fulbito/utils'
import type { LinkPlayerActions } from '@/components/LinkPlayerFlow'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useTournamentMembers } from './use-tournament-members'

export function useTournamentLinkPlayerActions(user: AppUser, tournamentId: string): LinkPlayerActions {
  const members = useTournamentMembers(tournamentId)
  const linkedPlayerIds = useMemo(
    () => new Set(members.flatMap((member) => (member.playerId ? [member.playerId] : []))),
    [members],
  )
  const linksDirectly = isTournamentAdminRole(members.find((member) => member.uid === user.uid)?.role)

  return {
    send: async (request) => {
      const outcome = await linkOrRequestTournamentPlayer({
        tournamentId,
        uid: user.uid,
        email: user.email,
        ...request,
      })
      if (outcome === 'linked') {
        await useTournamentStore.getState().loadMyTournaments(user.uid)
        if (useTournamentStore.getState().activeTournamentId === tournamentId) {
          await usePlayerStore.getState().resetAndReload()
        }
      }
      return outcome
    },
    cancel: () => cancelTournamentPlayerRequest(tournamentId, user.uid),
    isPlayerUnavailable: (player) => linkedPlayerIds.has(player.id),
    linksDirectly,
    reviewerDescription: 'Un organizador del torneo la va a revisar.',
  }
}
