import { getMyMatchEntries } from '@fulbito/firebase'
import type { MyMatchEntry } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'

import { useMembershipRefs } from '@/hooks/use-membership-refs'

export type MyMatchEntriesState = {
  entries: MyMatchEntry[]
  loading: boolean
  error: boolean
  reload: () => void
  removeMatch: (matchId: string) => void
}

const NO_ENTRIES: MyMatchEntry[] = []

export function useMyMatchEntries(enabled: boolean): MyMatchEntriesState {
  const refs = useMembershipRefs()
  const [entries, setEntries] = useState<MyMatchEntry[]>(NO_ENTRIES)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let isCurrent = true
    setLoading(true)
    setError(false)
    getMyMatchEntries(refs)
      .then((loaded) => {
        if (isCurrent) setEntries(loaded)
      })
      .catch(() => {
        if (isCurrent) setError(true)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })
    return () => {
      isCurrent = false
    }
  }, [enabled, refs, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])
  const removeMatch = useCallback(
    (matchId: string) => setEntries((previous) => previous.filter(({ match }) => match.id !== matchId)),
    [],
  )

  return { entries, loading, error, reload, removeMatch }
}
