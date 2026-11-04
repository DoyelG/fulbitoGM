import {
  createVideoClip,
  deleteVideoClip as removeVideoClip,
  getVideoClips,
  type NewVideoClipData,
} from '@fulbito/firebase'
import type { VideoClip } from '@fulbito/types'
import { useCallback } from 'react'

import { useActiveTournamentId } from '@/contexts/TournamentContext'
import { useTournamentResource } from '@/hooks/use-tournament-resource'

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

const EMPTY_VIDEO_CLIPS: VideoClip[] = []

export function useVideoClipsData(): VideoClipsDataState {
  const tournamentId = useActiveTournamentId()
  const {
    data: videoClips,
    setData: setVideoClips,
    loading,
    refreshing,
    error,
    reload,
    refresh,
  } = useTournamentResource(tournamentId, getVideoClips, EMPTY_VIDEO_CLIPS, 'Error al cargar los clips')

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
    [videoClips, setVideoClips, reload],
  )

  return { videoClips, loading, refreshing, error, reload, refresh, addVideoClip, deleteVideoClip }
}
