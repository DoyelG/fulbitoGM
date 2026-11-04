import { create } from 'zustand'
import type {
  Invitation,
  InvitationInput,
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
  type TournamentCommentsCursor,
} from '@fulbito/firebase'

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

type CommentAuthor = { uid: string; name: string }

type TournamentDetailStore = {
  tournamentId: string | null
  members: TournamentMember[]
  comments: TournamentComment[]
  commentsCursor: TournamentCommentsCursor | null
  players: Player[]
  matches: Match[]
  playerRequests: TournamentPlayerRequest[]
  invitations: Invitation[]
  playerRequestsFailed: boolean
  invitationsFailed: boolean
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
  loadMoreComments: () => Promise<void>
  addComment: (text: string, author: CommentAuthor) => Promise<void>
  removeComment: (commentId: string) => Promise<void>
}

export const useTournamentDetailStore = create<TournamentDetailStore>()((set, get) => ({
  tournamentId: null,
  members: [],
  comments: [],
  commentsCursor: null,
  players: [],
  matches: [],
  playerRequests: [],
  invitations: [],
  playerRequestsFailed: false,
  invitationsFailed: false,
  status: 'idle',
  load: async (tournamentId) => {
    set({
      tournamentId,
      status: 'loading',
      members: [],
      comments: [],
      commentsCursor: null,
      players: [],
      matches: [],
      playerRequests: [],
      invitations: [],
      playerRequestsFailed: false,
      invitationsFailed: false,
    })
    try {
      const [members, commentsPage, players, matches] = await Promise.all([
        getTournamentMembers(tournamentId),
        getTournamentComments(tournamentId),
        getPlayers(tournamentId),
        getMatches(tournamentId),
      ])
      if (get().tournamentId !== tournamentId) return
      set({
        members,
        comments: commentsPage.comments,
        commentsCursor: commentsPage.nextCursor,
        players,
        matches,
        status: 'loaded',
      })
    } catch {
      if (get().tournamentId === tournamentId) set({ status: 'error' })
    }
  },
  loadPlayerRequests: async (tournamentId) => {
    try {
      const playerRequests = await getPendingTournamentPlayerRequests(tournamentId)
      if (get().tournamentId === tournamentId) set({ playerRequests, playerRequestsFailed: false })
    } catch {
      if (get().tournamentId === tournamentId) set({ playerRequestsFailed: true })
    }
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
    try {
      const invitations = await getTournamentInvitations(tournamentId)
      if (get().tournamentId === tournamentId) set({ invitations, invitationsFailed: false })
    } catch {
      if (get().tournamentId === tournamentId) set({ invitationsFailed: true })
    }
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
  loadMoreComments: async () => {
    const { tournamentId, commentsCursor } = get()
    if (!tournamentId || !commentsCursor) return
    const { comments, nextCursor } = await getTournamentComments(tournamentId, commentsCursor)
    if (get().tournamentId !== tournamentId || get().commentsCursor !== commentsCursor) return
    set((state) => ({ comments: [...state.comments, ...comments], commentsCursor: nextCursor }))
  },
  addComment: async (text, author) => {
    const tournamentId = get().tournamentId
    if (!tournamentId) throw new Error('No tournament loaded')
    await addTournamentComment({ tournamentId, authorUid: author.uid, authorName: author.name, text })
    const { comments, nextCursor } = await getTournamentComments(tournamentId)
    if (get().tournamentId === tournamentId) set({ comments, commentsCursor: nextCursor })
  },
  removeComment: async (commentId) => {
    const tournamentId = get().tournamentId
    if (!tournamentId) throw new Error('No tournament loaded')
    await deleteTournamentComment(tournamentId, commentId)
    set((state) => ({ comments: state.comments.filter((comment) => comment.id !== commentId) }))
  },
}))
