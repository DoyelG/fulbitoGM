'use client'

import { useCallback, useEffect, useState } from 'react'
import type { MyMatchEntry, MyTournament } from '@fulbito/types'
import { getMyMatchEntries } from '@fulbito/firebase'
import { useMembershipRefs } from './use-membership-refs'

export type MyMatchEntriesState = { status: 'loading' | 'error' } | { status: 'ready'; entries: MyMatchEntry[] }

export function useMyMatchEntries(myTournaments: MyTournament[], enabled = true) {
  const refs = useMembershipRefs(myTournaments)
  const [state, setState] = useState<MyMatchEntriesState>({ status: 'loading' })

  useEffect(() => {
    if (!enabled) return
    let isCurrent = true
    setState({ status: 'loading' })
    getMyMatchEntries(refs)
      .then((entries) => {
        if (isCurrent) setState({ status: 'ready', entries })
      })
      .catch(() => {
        if (isCurrent) setState({ status: 'error' })
      })
    return () => {
      isCurrent = false
    }
  }, [enabled, refs])

  const removeMatch = useCallback((matchId: string) => {
    setState((previous) =>
      previous.status === 'ready'
        ? { status: 'ready', entries: previous.entries.filter(({ match }) => match.id !== matchId) }
        : previous,
    )
  }, [])

  return { state, removeMatch }
}
