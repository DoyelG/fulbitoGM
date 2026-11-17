import { create } from 'zustand'
import type { MyTournament, TournamentComment } from '@fulbito/types'
import { commentsSeenSince } from '@fulbito/utils'
import { markTournamentCommentsSeen, subscribeToTournamentCommentsSince } from '@fulbito/firebase'

type UnreadCommentsStore = {
  unreadByTournament: Record<string, number>
  watchUnread: (myTournaments: MyTournament[], uid: string) => () => void
  markSeen: (tournamentId: string, uid: string) => Promise<void>
  clear: () => void
}

type Watched = { item: MyTournament; uid: string; comments: TournamentComment[] }

const seenThisSession = new Map<string, Date>()
const watched = new Map<string, Watched>()

export function commentsUnreadSince(item: MyTournament): Date {
  const stored = commentsSeenSince(item.membership)
  const local = seenThisSession.get(item.tournament.id)
  return local && local > stored ? local : stored
}

function countUnread({ item, uid, comments }: Watched): number {
  const since = commentsUnreadSince(item)
  return comments.filter((comment) => comment.authorUid !== uid && comment.createdAt > since).length
}

export const useUnreadCommentsStore = create<UnreadCommentsStore>()((set) => ({
  unreadByTournament: {},
  watchUnread: (myTournaments, uid) => {
    watched.clear()
    set((state) => ({
      unreadByTournament: Object.fromEntries(
        myTournaments.map((item) => [item.tournament.id, state.unreadByTournament[item.tournament.id] ?? 0]),
      ),
    }))
    const unsubscribes = myTournaments.map((item) => {
      const tournamentId = item.tournament.id
      const entry: Watched = { item, uid, comments: [] }
      watched.set(tournamentId, entry)
      return subscribeToTournamentCommentsSince(
        tournamentId,
        commentsUnreadSince(item),
        (comments) => {
          if (watched.get(tournamentId) !== entry) return
          entry.comments = comments
          set((state) => ({ unreadByTournament: { ...state.unreadByTournament, [tournamentId]: countUnread(entry) } }))
        },
        () => {
          if (watched.get(tournamentId) !== entry) return
          set((state) => ({ unreadByTournament: { ...state.unreadByTournament, [tournamentId]: 0 } }))
        },
      )
    })
    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe()
      for (const item of myTournaments) watched.delete(item.tournament.id)
    }
  },
  markSeen: async (tournamentId, uid) => {
    seenThisSession.set(tournamentId, new Date())
    set((state) => ({ unreadByTournament: { ...state.unreadByTournament, [tournamentId]: 0 } }))
    try {
      await markTournamentCommentsSeen(tournamentId, uid)
    } catch {
      return
    }
  },
  clear: () => {
    watched.clear()
    seenThisSession.clear()
    set({ unreadByTournament: {} })
  },
}))

export function selectTotalUnread(state: UnreadCommentsStore): number {
  return Object.values(state.unreadByTournament).reduce((total, count) => total + count, 0)
}

export function selectOnlyUnreadTournamentId(state: UnreadCommentsStore): string | null {
  const withUnread = Object.keys(state.unreadByTournament).filter((id) => (state.unreadByTournament[id] ?? 0) > 0)
  return withUnread.length === 1 ? (withUnread[0] ?? null) : null
}
