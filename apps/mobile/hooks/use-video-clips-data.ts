import {
  createVideoClip,
  deleteVideoClip as removeVideoClip,
  getVideoClips,
  type NewVideoClipData,
} from '@fulbito/firebase'
import type { VideoClip } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'

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
  const [videoClips, setVideoClips] = useState<VideoClip[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      setVideoClips(await getVideoClips())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar los clips')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await reload()
  }, [reload])

  const addVideoClip = useCallback(
    async (data: NewVideoClipData, fileUri: string) => {
      const blob = await (await fetch(fileUri)).blob()
      await createVideoClip(data, blob)
      await reload()
    },
    [reload],
  )

  const deleteVideoClip = useCallback(
    async (id: string) => {
      await removeVideoClip(id)
      setVideoClips((previous) => previous.filter((clip) => clip.id !== id))
      await reload()
    },
    [reload],
  )

  useEffect(() => {
    void reload()
  }, [reload])

  return { videoClips, loading, refreshing, error, reload, refresh, addVideoClip, deleteVideoClip }
}
