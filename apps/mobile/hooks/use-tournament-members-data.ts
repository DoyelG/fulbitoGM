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
import type { Invitation, InvitationInput, InvitationRole, Player, TournamentMember } from '@fulbito/types'
import { useCallback, useEffect, useRef, useState } from 'react'

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
  const currentTournamentId = useRef(tournamentId)
  const latestLoadId = useRef(0)

  useEffect(() => {
    currentTournamentId.current = tournamentId
  }, [tournamentId])

  const fetchInvitations = useCallback(
    async () => (canManage ? getTournamentInvitations(tournamentId) : []),
    [tournamentId, canManage],
  )

  const loadInvitations = useCallback(async () => {
    const nextInvitations = await fetchInvitations()
    if (currentTournamentId.current === tournamentId) setInvitations(nextInvitations)
  }, [tournamentId, fetchInvitations])

  const reload = useCallback(async () => {
    const loadId = ++latestLoadId.current
    const isLatestLoad = () => loadId === latestLoadId.current && currentTournamentId.current === tournamentId
    try {
      const [nextMembers, nextPlayers, nextInvitations] = await Promise.all([
        getTournamentMembers(tournamentId),
        getPlayers(tournamentId),
        fetchInvitations(),
      ])
      if (!isLatestLoad()) return
      setMembers(nextMembers)
      setPlayers(nextPlayers)
      setInvitations(nextInvitations)
      setStatus('loaded')
    } catch {
      if (isLatestLoad()) setStatus('error')
    }
  }, [tournamentId, fetchInvitations])

  useEffect(() => {
    setMembers([])
    setPlayers([])
    setInvitations([])
    setStatus('loading')
  }, [tournamentId])

  useEffect(() => {
    void reload()
  }, [reload])

  const reloadMembers = useCallback(async () => {
    const nextMembers = await getTournamentMembers(tournamentId)
    if (currentTournamentId.current === tournamentId) setMembers(nextMembers)
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
