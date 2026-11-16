import { markTournamentCommentsSeen, subscribeToTournamentCommentsSince } from '@fulbito/firebase'
import type { MyTournament, TournamentComment } from '@fulbito/types'
import { commentsSeenSince } from '@fulbito/utils'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournaments } from '@/contexts/TournamentContext'

type UnreadCommentsContextValue = {
  unreadByTournament: Record<string, number>
  totalUnread: number
  markSeen: (tournamentId: string) => void
  unreadSince: (item: MyTournament) => Date
}

const UnreadCommentsContext = createContext<UnreadCommentsContextValue | null>(null)

export function UnreadCommentsProvider({ children }: { children: ReactNode }) {
  const { user } = useFirebaseAuth()
  const uid = user?.uid ?? null
  const { myTournaments, status } = useTournaments()
  const [unreadByTournament, setUnreadByTournament] = useState<Record<string, number>>({})
  const seenThisSession = useRef(new Map<string, Date>())
  const liveComments = useRef(new Map<string, TournamentComment[]>())

  const seenSince = useCallback((item: MyTournament): Date => {
    const stored = commentsSeenSince(item.membership)
    const local = seenThisSession.current.get(item.tournament.id)
    return local && local > stored ? local : stored
  }, [])

  useEffect(() => {
    if (!uid) {
      seenThisSession.current.clear()
      liveComments.current.clear()
      setUnreadByTournament({})
      return
    }
    if (status !== 'loaded') return
    const live = liveComments.current
    const countUnread = (item: MyTournament): number => {
      const since = seenSince(item)
      const comments = live.get(item.tournament.id) ?? []
      return comments.filter((comment) => comment.authorUid !== uid && comment.createdAt > since).length
    }
    setUnreadByTournament((previous) =>
      Object.fromEntries(myTournaments.map((item) => [item.tournament.id, previous[item.tournament.id] ?? 0])),
    )
    const unsubscribes = myTournaments.map((item) =>
      subscribeToTournamentCommentsSince(
        item.tournament.id,
        seenSince(item),
        (comments) => {
          live.set(item.tournament.id, comments)
          setUnreadByTournament((previous) => ({ ...previous, [item.tournament.id]: countUnread(item) }))
        },
        () => setUnreadByTournament((previous) => ({ ...previous, [item.tournament.id]: 0 })),
      ),
    )
    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe()
      live.clear()
    }
  }, [uid, status, myTournaments, seenSince])

  const markSeen = useCallback(
    (tournamentId: string) => {
      if (!uid) return
      seenThisSession.current.set(tournamentId, new Date())
      setUnreadByTournament((previous) => ({ ...previous, [tournamentId]: 0 }))
      markTournamentCommentsSeen(tournamentId, uid).catch(() => undefined)
    },
    [uid],
  )

  const value = useMemo<UnreadCommentsContextValue>(
    () => ({
      unreadByTournament,
      totalUnread: Object.values(unreadByTournament).reduce((total, count) => total + count, 0),
      markSeen,
      unreadSince: seenSince,
    }),
    [unreadByTournament, markSeen, seenSince],
  )

  return <UnreadCommentsContext.Provider value={value}>{children}</UnreadCommentsContext.Provider>
}

export function useUnreadComments(): UnreadCommentsContextValue {
  const ctx = useContext(UnreadCommentsContext)
  if (!ctx) throw new Error('useUnreadComments must be used inside UnreadCommentsProvider')
  return ctx
}
