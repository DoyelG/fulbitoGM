import type { MyTournament } from '@fulbito/types'
import { useIsFocused } from 'expo-router'
import { useEffect, useState } from 'react'

import { useUnreadComments } from '@/contexts/UnreadCommentsContext'

type Captured = { tournamentId: string; since: Date }

export function useCommentsUnreadSince(item: MyTournament | null, ready: boolean): Date | null {
  const { unreadByTournament, markSeen, unreadSince } = useUnreadComments()
  const isFocused = useIsFocused()
  const [captured, setCaptured] = useState<Captured | null>(null)
  const tournamentId = item?.tournament.id ?? null
  const unread = tournamentId ? (unreadByTournament[tournamentId] ?? 0) : 0
  const isCaptured = isFocused && captured !== null && captured.tournamentId === tournamentId

  useEffect(() => {
    if (!isFocused) {
      if (captured) setCaptured(null)
      return
    }
    if (!ready || !item || captured?.tournamentId === item.tournament.id) return
    setCaptured({ tournamentId: item.tournament.id, since: unreadSince(item) })
    markSeen(item.tournament.id)
  }, [isFocused, ready, item, captured, unreadSince, markSeen])

  useEffect(() => {
    if (isCaptured && tournamentId && unread > 0) markSeen(tournamentId)
  }, [isCaptured, tournamentId, unread, markSeen])

  return isCaptured ? captured.since : null
}
