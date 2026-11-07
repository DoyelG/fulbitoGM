import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

export type TournamentResource<T> = {
  data: T
  setData: Dispatch<SetStateAction<T>>
  loading: boolean
  refreshing: boolean
  error: string | null
  reload: () => Promise<void>
  refresh: () => Promise<void>
}

export function useTournamentResource<T>(
  tournamentId: string | null,
  fetcher: (tournamentId: string) => Promise<T>,
  emptyData: T,
  errorMessage: string,
): TournamentResource<T> {
  const [data, setData] = useState<T>(emptyData)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentTournamentId = useRef(tournamentId)
  const latestLoadId = useRef(0)

  useEffect(() => {
    currentTournamentId.current = tournamentId
  }, [tournamentId])

  const reload = useCallback(async () => {
    const loadId = ++latestLoadId.current
    if (!tournamentId) {
      setLoading(false)
      setRefreshing(false)
      return
    }
    const isLatestLoad = () => loadId === latestLoadId.current && currentTournamentId.current === tournamentId
    setError(null)
    try {
      const nextData = await fetcher(tournamentId)
      if (isLatestLoad()) setData(nextData)
    } catch (e) {
      if (isLatestLoad()) setError(e instanceof Error ? e.message : errorMessage)
    } finally {
      if (isLatestLoad()) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [tournamentId, fetcher, errorMessage])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await reload()
  }, [reload])

  useEffect(() => {
    setData(emptyData)
    setLoading(true)
    void reload()
  }, [reload, emptyData])

  return { data, setData, loading, refreshing, error, reload, refresh }
}
