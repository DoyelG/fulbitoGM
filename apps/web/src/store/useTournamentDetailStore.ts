import { create } from 'zustand'
import type {
  Invitation,
  InvitationRole,
  Match,
  Player,
  TournamentComment,
  TournamentMember,
  TournamentPlayerRequest,
} from '@fulbito/types'
import {
  addTournamentComment,
  createInvitation,
  deleteTournamentComment,
  getMatches,
  getPendingTournamentPlayerRequests,
  getPlayers,
  getTournamentComments,
  getTournamentInvitations,
  getTournamentMembers,
  removeMember,
  resolveTournamentPlayerRequest,
  revokeInvitation,
  setMemberPlayer,
  setMemberRole,
} from '@fulbito/firebase'

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

type CommentAuthor = { uid: string; name: string }

export type InvitationInput = { email: string; role: InvitationRole; playerId?: string }

type TournamentDetailStore = {
  tournamentId: string | null
  members: TournamentMember[]
  comments: TournamentComment[]
  players: Player[]
  matches: Match[]
  playerRequests: TournamentPlayerRequest[]
  invitations: Invitation[]
  status: LoadStatus
  load: (tournamentId: string) => Promise<void>
  loadPlayerRequests: (tournamentId: string) => Promise<void>
  resolvePlayerRequest: (uid: string, action: 'accepted' | 'rejected', adminUid: string) => Promise<void>
  loadInvitations: (tournamentId: string) => Promise<void>
  invite: (input: InvitationInput, invitedBy: string) => Promise<void>
  revokeInvitation: (invitationId: string) => Promise<void>
  assignMemberPlayer: (uid: string, playerId: string | null) => Promise<void>
  changeMemberRole: (uid: string, role: InvitationRole) => Promise<void>
  removeMember: (uid: string, actorUid: string) => Promise<void>
  addComment: (text: string, author: CommentAuthor) => Promise<void>
  removeComment: (commentId: string) => Promise<void>
}

export const useTournamentDetailStore = create<TournamentDetailStore>()((set, get) => ({
  tournamentId: null,
  members: [],
  comments: [],
  players: [],
  matches: [],
  playerRequests: [],
  invitations: [],
  status: 'idle',
  load: async (tournamentId) => {
    set({
      tournamentId,
      status: 'loading',
      members: [],
      comments: [],
      players: [],
      matches: [],
      playerRequests: [],
      invitations: [],
    })
    try {
      const [members, comments, players, matches] = await Promise.all([
        getTournamentMembers(tournamentId),
        getTournamentComments(tournamentId),
        getPlayers(tournamentId),
        getMatches(tournamentId),
      ])
      if (get().tournamentId !== tournamentId) return
      set({ members, comments, players, matches, status: 'loaded' })
    } catch {
      if (get().tournamentId === tournamentId) set({ status: 'error' })
    }
  },
  loadPlayerRequests: async (tournamentId) => {
    const playerRequests = await getPendingTournamentPlayerRequests(tournamentId)
    if (get().tournamentId === tournamentId) set({ playerRequests })
  },
  resolvePlayerRequest: async (uid, action, adminUid) => {
    const tournamentId = get().tournamentId
    if (!tournamentId) throw new Error('No tournament loaded')
    await resolveTournamentPlayerRequest(tournamentId, uid, action, adminUid)
    const [members, playerRequests, players] = await Promise.all([
      getTournamentMembers(tournamentId),
      getPendingTournamentPlayerRequests(tournamentId),
      getPlayers(tournamentId),
    ])
    if (get().tournamentId === tournamentId) set({ members, playerRequests, players })
  },
  loadInvitations: async (tournamentId) => {
    const invitations = await getTournamentInvitations(tournamentId)
    if (get().tournamentId === tournamentId) set({ invitations })
  },
  invite: async (input, invitedBy) => {
    const tournamentId = get().tournamentId
    if (!tournamentId) throw new Error('No tournament loaded')
    await createInvitation({ tournamentId, invitedBy, ...input })
    await get().loadInvitations(tournamentId)
  },
  revokeInvitation: async (invitationId) => {
    await revokeInvitation(invitationId)
    set((state) => ({ invitations: state.invitations.filter((invitation) => invitation.id !== invitationId) }))
  },
  assignMemberPlayer: async (uid, playerId) => {
    const tournamentId = get().tournamentId
    if (!tournamentId) throw new Error('No tournament loaded')
    await setMemberPlayer(tournamentId, uid, playerId)
    const members = await getTournamentMembers(tournamentId)
    if (get().tournamentId === tournamentId) set({ members })
  },
  changeMemberRole: async (uid, role) => {
    const tournamentId = get().tournamentId
    if (!tournamentId) throw new Error('No tournament loaded')
    await setMemberRole(tournamentId, uid, role)
    const members = await getTournamentMembers(tournamentId)
    if (get().tournamentId === tournamentId) set({ members })
  },
  removeMember: async (uid, actorUid) => {
    const tournamentId = get().tournamentId
    if (!tournamentId) throw new Error('No tournament loaded')
    await removeMember(tournamentId, uid, actorUid)
    set((state) => ({ members: state.members.filter((member) => member.uid !== uid) }))
  },
  addComment: async (text, author) => {
    const tournamentId = get().tournamentId
    if (!tournamentId) throw new Error('No tournament loaded')
    await addTournamentComment({ tournamentId, authorUid: author.uid, authorName: author.name, text })
    const comments = await getTournamentComments(tournamentId)
    if (get().tournamentId === tournamentId) set({ comments })
  },
  removeComment: async (commentId) => {
    const tournamentId = get().tournamentId
    if (!tournamentId) throw new Error('No tournament loaded')
    await deleteTournamentComment(tournamentId, commentId)
    set((state) => ({ comments: state.comments.filter((comment) => comment.id !== commentId) }))
  },
}))
