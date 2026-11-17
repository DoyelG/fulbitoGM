'use client'

import { useEffect, useState } from 'react'
import type { MyTournament } from '@fulbito/types'
import { commentsUnreadSince, useUnreadCommentsStore } from '@/store/useUnreadCommentsStore'

type Captured = { tournamentId: string; since: Date }

export function useCommentsUnreadSince(item: MyTournament | null, uid: string | null, ready: boolean): Date | null {
  const markSeen = useUnreadCommentsStore((state) => state.markSeen)
  const [captured, setCaptured] = useState<Captured | null>(null)
  const tournamentId = item?.tournament.id ?? null
  const unread = useUnreadCommentsStore((state) => (tournamentId ? (state.unreadByTournament[tournamentId] ?? 0) : 0))
  const isCaptured = captured !== null && captured.tournamentId === tournamentId

  useEffect(() => {
    if (!ready || !uid || !item || captured?.tournamentId === item.tournament.id) return
    setCaptured({ tournamentId: item.tournament.id, since: commentsUnreadSince(item) })
    void markSeen(item.tournament.id, uid)
  }, [ready, uid, item, captured, markSeen])

  useEffect(() => {
    if (isCaptured && uid && tournamentId && unread > 0) void markSeen(tournamentId, uid)
  }, [isCaptured, uid, tournamentId, unread, markSeen])

  return isCaptured ? captured.since : null
}
