import type { VideoClip, VideoClipCategory } from '@fulbito/types'
import { createVideoClip, deleteVideoClip as deleteVideoClipRemote, getVideoClips, uploadVideoClip } from '@fulbito/firebase'
import { useCallback, useEffect, useState } from 'react'

export type NewVideoClipData = {
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
}

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

  const addVideoClip = useCallback(async (data: NewVideoClipData, fileUri: string) => {
    const id = crypto.randomUUID()
    const response = await fetch(fileUri)
    const blob = await response.blob()
    const url = await uploadVideoClip(blob, id)
    await createVideoClip(id, { ...data, url })
    await reload()
  }, [reload])

  const deleteVideoClip = useCallback(async (id: string) => {
    await deleteVideoClipRemote(id)
    setVideoClips(prev => prev.filter(c => c.id !== id))
    await reload()
  }, [reload])

  useEffect(() => { void reload() }, [reload])

  return { videoClips, loading, refreshing, error, reload, refresh, addVideoClip, deleteVideoClip }
}
