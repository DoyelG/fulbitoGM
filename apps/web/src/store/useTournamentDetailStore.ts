import { create } from 'zustand'
import type { TournamentComment, TournamentMember } from '@fulbito/types'
import {
  addTournamentComment,
  deleteTournamentComment,
  getTournamentComments,
  getTournamentMembers,
} from '@fulbito/firebase'

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

type CommentAuthor = { uid: string; name: string }

type TournamentDetailStore = {
  tournamentId: string | null
  members: TournamentMember[]
  comments: TournamentComment[]
  status: LoadStatus
  load: (tournamentId: string) => Promise<void>
  addComment: (text: string, author: CommentAuthor) => Promise<void>
  removeComment: (commentId: string) => Promise<void>
}

export const useTournamentDetailStore = create<TournamentDetailStore>()((set, get) => ({
  tournamentId: null,
  members: [],
  comments: [],
  status: 'idle',
  load: async (tournamentId) => {
    set({ tournamentId, status: 'loading', members: [], comments: [] })
    try {
      const [members, comments] = await Promise.all([
        getTournamentMembers(tournamentId),
        getTournamentComments(tournamentId),
      ])
      if (get().tournamentId !== tournamentId) return
      set({ members, comments, status: 'loaded' })
    } catch {
      if (get().tournamentId === tournamentId) set({ status: 'error' })
    }
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
