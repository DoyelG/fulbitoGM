import {
  createInvitation,
  getPlayers,
  getTournamentInvitations,
  getTournamentMembers,
  removeMember,
  revokeInvitation,
  setMemberPlayer,
  setMemberRole,
} from '@fulbito/firebase'
import type { Invitation, InvitationRole, Player, TournamentMember } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'

export type InvitationInput = { email: string; role: InvitationRole; playerId?: string }

export type TournamentMembersDataState = {
  members: TournamentMember[]
  players: Player[]
  invitations: Invitation[]
  status: 'loading' | 'loaded' | 'error'
  reload: () => Promise<void>
  assignPlayer: (uid: string, playerId: string | null) => Promise<void>
  changeRole: (uid: string, role: InvitationRole) => Promise<void>
  remove: (uid: string, actorUid: string) => Promise<void>
  invite: (input: InvitationInput, invitedBy: string) => Promise<void>
  revoke: (invitationId: string) => Promise<void>
}

export function useTournamentMembersData(tournamentId: string, canManage: boolean): TournamentMembersDataState {
  const [members, setMembers] = useState<TournamentMember[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [status, setStatus] = useState<TournamentMembersDataState['status']>('loading')

  const loadInvitations = useCallback(async () => {
    if (canManage) setInvitations(await getTournamentInvitations(tournamentId))
  }, [tournamentId, canManage])

  const reload = useCallback(async () => {
    try {
      const [nextMembers, nextPlayers] = await Promise.all([
        getTournamentMembers(tournamentId),
        getPlayers(tournamentId),
        loadInvitations(),
      ])
      setMembers(nextMembers)
      setPlayers(nextPlayers)
      setStatus('loaded')
    } catch {
      setStatus('error')
    }
  }, [tournamentId, loadInvitations])

  useEffect(() => {
    void reload()
  }, [reload])

  const reloadMembers = useCallback(async () => {
    setMembers(await getTournamentMembers(tournamentId))
  }, [tournamentId])

  const assignPlayer = useCallback(
    async (uid: string, playerId: string | null) => {
      await setMemberPlayer(tournamentId, uid, playerId)
      await reloadMembers()
    },
    [tournamentId, reloadMembers],
  )

  const changeRole = useCallback(
    async (uid: string, role: InvitationRole) => {
      await setMemberRole(tournamentId, uid, role)
      await reloadMembers()
    },
    [tournamentId, reloadMembers],
  )

  const remove = useCallback(
    async (uid: string, actorUid: string) => {
      await removeMember(tournamentId, uid, actorUid)
      setMembers((previous) => previous.filter((member) => member.uid !== uid))
    },
    [tournamentId],
  )

  const invite = useCallback(
    async (input: InvitationInput, invitedBy: string) => {
      await createInvitation({ tournamentId, invitedBy, ...input })
      await loadInvitations()
    },
    [tournamentId, loadInvitations],
  )

  const revoke = useCallback(async (invitationId: string) => {
    await revokeInvitation(invitationId)
    setInvitations((previous) => previous.filter((invitation) => invitation.id !== invitationId))
  }, [])

  return { members, players, invitations, status, reload, assignPlayer, changeRole, remove, invite, revoke }
}
