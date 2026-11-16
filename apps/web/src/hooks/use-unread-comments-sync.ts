'use client'

import { useEffect } from 'react'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useUnreadCommentsStore } from '@/store/useUnreadCommentsStore'

export function useUnreadCommentsSync(uid: string | null): void {
  const myTournaments = useTournamentStore((state) => state.myTournaments)
  const isLoaded = useTournamentStore((state) => state.myTournamentsInit === 'loaded' && state.myTournamentsUid === uid)
  const watchUnread = useUnreadCommentsStore((state) => state.watchUnread)
  const clear = useUnreadCommentsStore((state) => state.clear)

  useEffect(() => {
    if (!uid) {
      clear()
      return
    }
    if (!isLoaded) return
    return watchUnread(myTournaments, uid)
  }, [uid, isLoaded, myTournaments, watchUnread, clear])
}
