import {
  createVideoClip,
  deleteVideoClip as removeVideoClip,
  getVideoClips,
  type NewVideoClipData,
} from '@fulbito/firebase'
import type { VideoClip } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'

import { useActiveTournamentId } from '@/contexts/TournamentContext'

export type { NewVideoClipData }

export type VideoClipsDataState = {
  videoClips: VideoClip[]
  loading: boolean
  refreshing: boolean
  error: string | null
  reload: () => Promise<void>
  refresh: () => Promise<void>
  addVideoClip: (data: NewVideoClipData, fileUri: string) => Promise<void>
  deleteVideoClip: (id: string) => Promise<void>
}

export function useVideoClipsData(): VideoClipsDataState {
  const tournamentId = useActiveTournamentId()
  const [videoClips, setVideoClips] = useState<VideoClip[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!tournamentId) return
    setError(null)
    try {
      setVideoClips(await getVideoClips(tournamentId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar los clips')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [tournamentId])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await reload()
  }, [reload])

  const addVideoClip = useCallback(
    async (data: NewVideoClipData, fileUri: string) => {
      if (!tournamentId) return
      const blob = await (await fetch(fileUri)).blob()
      await createVideoClip(tournamentId, data, blob)
      await reload()
    },
    [tournamentId, reload],
  )

  const deleteVideoClip = useCallback(
    async (id: string) => {
      const clip = videoClips.find((item) => item.id === id)
      if (!clip) return
      await removeVideoClip(clip)
      setVideoClips((previous) => previous.filter((item) => item.id !== id))
      await reload()
    },
    [videoClips, reload],
  )

  useEffect(() => {
    setVideoClips([])
    setLoading(true)
    void reload()
  }, [reload])

  return { videoClips, loading, refreshing, error, reload, refresh, addVideoClip, deleteVideoClip }
}
